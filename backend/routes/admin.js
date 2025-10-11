const express = require('express');
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Simple admin authentication middleware (you should implement proper admin auth)
const requireAdmin = (req, res, next) => {
  // For now, we'll skip authentication - implement proper admin auth later
  next();
};

// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get total health checks from HealthCheck collection
    const totalHealthChecks = await HealthCheck.countDocuments();

    // Get average compliance score
    const healthCheckStats = await HealthCheck.aggregate([
      {
        $group: {
          _id: null,
          totalScore: { $sum: '$score' },
          count: { $sum: 1 }
        }
      }
    ]);

    const averageComplianceScore = healthCheckStats.length > 0 && healthCheckStats[0].count > 0
      ? Math.round(healthCheckStats[0].totalScore / healthCheckStats[0].count)
      : 0;

    // Get active subscriptions count (non-free)
    const activeSubscriptions = await Subscription.countDocuments({
      isActive: true,
      status: 'active',
      type: { $ne: 'free' }
    });

    // Calculate total revenue
    const subscriptionRevenue = await Subscription.aggregate([
      {
        $match: {
          isActive: true,
          status: 'active',
          type: { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let totalRevenue = 0;
    subscriptionRevenue.forEach(sub => {
      totalRevenue += sub.totalAmount || 0;
      // Fallback calculation if amount is not set
      if (!sub.totalAmount) {
        if (sub._id === 'premium') totalRevenue += sub.count * 5000;
        if (sub._id === 'enterprise') totalRevenue += sub.count * 15000;
      }
    });

    // Get users with critical issues (score < 50)
    const criticalIssues = await HealthCheck.countDocuments({
      score: { $lt: 50 }
    });

    // Calculate completion rate (users who have completed at least one health check)
    const usersWithHealthChecks = await HealthCheck.distinct('userId').then(userIds => userIds.length);
    const completionRate = totalUsers > 0 ? Math.round((usersWithHealthChecks / totalUsers) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalHealthChecks,
        averageComplianceScore,
        newUsersThisMonth,
        activeSubscriptions,
        totalRevenue,
        completionRate,
        criticalIssues
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard data',
      error: error.message
    });
  }
});

// GET /api/admin/users/recent - Get recent users
router.get('/users/recent', requireAdmin, async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email startupName createdAt lastLoginAt')
      .lean();

    // Simplified response without complex aggregations for now
    const formattedUsers = recentUsers.map(user => ({
      id: user._id,
      email: user.email,
      startupName: user.startupName,
      joinDate: user.createdAt,
      lastHealthCheck: null, // Will be populated later when we fix the aggregation
      complianceScore: null, // Will be populated later when we fix the aggregation
      subscriptionPlan: 'Free' // Default for now
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent users',
      error: error.message
    });
  }
});

// GET /api/admin/health-checks/recent - Get recent health checks
router.get('/health-checks/recent', requireAdmin, async (req, res) => {
  try {
    const recentHealthChecks = await HealthCheck.find()
      .sort({ assessmentDate: -1 })
      .limit(10)
      .populate('userId', 'email startupName')
      .lean();

    const formattedHealthChecks = recentHealthChecks.map((healthCheck, index) => ({
      id: healthCheck._id,
      userEmail: healthCheck.userId?.email || 'Unknown',
      startupName: healthCheck.userId?.startupName || 'Unknown',
      score: healthCheck.score || 0,
      completedAt: healthCheck.assessmentDate,
      criticalIssues: healthCheck.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0 // Mock critical issues count
    }));

    res.status(200).json({
      success: true,
      data: formattedHealthChecks
    });

  } catch (error) {
    console.error('Recent health checks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent health checks',
      error: error.message
    });
  }
});

// GET /api/admin/users - Get all users with pagination and filters
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const subscription = req.query.subscription || 'all';

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { startupName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { founderName: { $regex: search, $options: 'i' } }
      ];
    }

    // Note: Subscription filtering will be handled after fetching users
    // since subscriptions are now in a separate collection

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('email startupName founderName city state country website contactNumber subscription createdAt lastLoginAt healthCheckResults isOnboardingComplete')
      .lean();

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get health checks and subscriptions for these users
    const userIds = users.map(user => user._id);

    const latestHealthChecks = await HealthCheck.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $sort: { assessmentDate: -1 } },
      {
        $group: {
          _id: '$userId',
          latestHealthCheck: { $first: '$$ROOT' },
          totalHealthChecks: { $sum: 1 }
        }
      }
    ]);

    const activeSubscriptions = await Subscription.find({
      userId: { $in: userIds },
      isActive: true,
      status: 'active'
    }).lean();

    // Create lookup maps
    const healthCheckMap = new Map();
    latestHealthChecks.forEach(item => {
      healthCheckMap.set(item._id.toString(), {
        latest: item.latestHealthCheck,
        total: item.totalHealthChecks
      });
    });

    const subscriptionMap = new Map();
    activeSubscriptions.forEach(sub => {
      subscriptionMap.set(sub.userId.toString(), sub);
    });

    const formattedUsers = users.map(user => {
      const userId = user._id.toString();
      const healthCheckData = healthCheckMap.get(userId);
      const subscription = subscriptionMap.get(userId);

      return {
        id: user._id,
        email: user.email,
        startupName: user.startupName,
        founderName: user.founderName,
        city: user.city,
        state: user.state,
        country: user.country,
        website: user.website,
        contactNumber: user.contactNumber,
        subscriptionPlan: (subscription && subscription.type)
          ? (subscription.type === 'free' ? 'Free' :
            subscription.type === 'premium' ? 'Elite' : 'Enterprise')
          : 'Free',
        subscriptionStatus: (subscription && subscription.isActive) ? 'Active' : 'Inactive',
        isOnboarded: user.isOnboardingComplete,
        joinDate: user.createdAt,
        lastLogin: user.lastLoginAt,
        lastHealthCheck: healthCheckData?.latest?.assessmentDate || null,
        complianceScore: healthCheckData?.latest?.score || null,
        totalHealthChecks: healthCheckData?.total || 0,
        status: (subscription && subscription.isActive) ? 'Active' : 'Inactive'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's health checks and subscription
    const healthChecks = await HealthCheck.find({ userId: req.params.id })
      .sort({ assessmentDate: -1 })
      .lean();

    const subscription = await Subscription.findOne({
      userId: req.params.id,
      isActive: true,
      status: 'active'
    }).lean();

    const latestHealthCheck = healthChecks.length > 0 ? healthChecks[0] : null;

    const formattedUser = {
      id: user._id,
      email: user.email,
      startupName: user.startupName,
      founderName: user.founderName,
      city: user.city,
      state: user.state,
      country: user.country,
      website: user.website,
      contactNumber: user.contactNumber,
      subscriptionPlan: (subscription && subscription.type)
        ? (subscription.type === 'free' ? 'Free' :
          subscription.type === 'premium' ? 'Elite' : 'Enterprise')
        : 'Free',
      subscriptionStatus: (subscription && subscription.isActive) ? 'Active' : 'Inactive',
      subscriptionStartDate: subscription?.startDate || null,
      subscriptionEndDate: subscription?.endDate || null,
      isOnboarded: user.isOnboardingComplete,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      lastHealthCheck: latestHealthCheck?.assessmentDate || null,
      complianceScore: latestHealthCheck?.score || null,
      totalHealthChecks: healthChecks.length,
      status: (subscription && subscription.isActive) ? 'Active' : 'Inactive',
      totalRevenue: subscription?.amount || 0,
      healthCheckHistory: healthChecks.map((check, index) => ({
        id: check._id,
        date: check.assessmentDate,
        score: check.score || 0,
        criticalIssues: check.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0,
        recommendations: check.recommendations || []
      }))
    };

    res.status(200).json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
});

// GET /api/admin/reports - Get compliance reports with filters
router.get('/reports', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    // Build match conditions
    let matchConditions = {};

    if (status === 'completed') {
      matchConditions.score = { $exists: true };
    } else if (status === 'failed') {
      matchConditions.score = { $lt: 50 };
    }

    // Get reports with user information
    const reports = await HealthCheck.find(matchConditions)
      .populate('userId', 'email startupName founderName')
      .sort({ assessmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Filter by search if provided
    let filteredReports = reports;
    if (search) {
      filteredReports = reports.filter(report =>
        report.userId?.startupName?.toLowerCase().includes(search.toLowerCase()) ||
        report.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        report.userId?.founderName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const formattedReports = filteredReports.map((healthCheck) => ({
      id: healthCheck._id.toString(),
      userId: healthCheck.userId?._id?.toString() || '',
      userEmail: healthCheck.userId?.email || 'Unknown',
      startupName: healthCheck.userId?.startupName || 'Unknown',
      founderName: healthCheck.userId?.founderName || 'Unknown',
      score: healthCheck.score || 0,
      completedAt: healthCheck.assessmentDate,
      criticalIssues: healthCheck.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0,
      status: 'Completed',
      riskLevel: healthCheck.score >= 80 ? 'low' :
        healthCheck.score >= 60 ? 'medium' :
          healthCheck.score >= 40 ? 'high' : 'critical',
      strengths: healthCheck.strengths || [],
      redFlags: healthCheck.redFlags || [],
      recommendations: Array.isArray(healthCheck.recommendations)
        ? healthCheck.recommendations.map(rec => typeof rec === 'string' ? rec : rec.description || rec.type || 'Recommendation')
        : [],
      categories: {
        legal: Math.floor(Math.random() * 20) + 80,
        financial: Math.floor(Math.random() * 20) + 70,
        operational: Math.floor(Math.random() * 20) + 75,
        regulatory: Math.floor(Math.random() * 20) + 85
      }
    }));

    // Get report statistics
    const totalReports = await HealthCheck.countDocuments();
    const statsData = await HealthCheck.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalScore: { $sum: '$score' },
          scoresCount: { $sum: { $cond: [{ $ne: ['$score', null] }, 1, 0] } },
          criticalIssues: { $sum: { $cond: [{ $lt: ['$score', 50] }, 1, 0] } }
        }
      }
    ]);

    const stats = statsData[0] || { totalReports: 0, totalScore: 0, scoresCount: 0, criticalIssues: 0 };
    const averageScore = stats.scoresCount > 0 ? Math.round(stats.totalScore / stats.scoresCount) : 0;

    // Get this month's completed reports
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await HealthCheck.countDocuments({
      assessmentDate: { $gte: startOfMonth }
    });

    const reportStats = {
      totalReports: stats.totalReports,
      averageScore,
      criticalIssues: stats.criticalIssues,
      completedThisMonth,
      improvementRate: 12, // Mock improvement rate
      topPerformingCategory: 'Legal Compliance'
    };

    const categoryStats = [
      { category: 'Legal Compliance', averageScore: 78, totalReports: stats.totalReports, improvement: 8 },
      { category: 'Financial Management', averageScore: 72, totalReports: stats.totalReports, improvement: 15 },
      { category: 'Operational Excellence', averageScore: 69, totalReports: stats.totalReports, improvement: 12 },
      { category: 'Regulatory Compliance', averageScore: 75, totalReports: stats.totalReports, improvement: 6 }
    ];

    res.status(200).json({
      success: true,
      data: {
        reports: formattedReports,
        stats: reportStats,
        categoryStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReports / limit),
          totalReports
        }
      }
    });

  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
});
// GET /api/admin/reports/:userId/:reportId - Get single report detail
router.get('/reports/:userId/:reportId', requireAdmin, async (req, res) => {
  try {
    const { userId, reportId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const healthCheck = await HealthCheck.findById(reportId).lean();
    if (!healthCheck || healthCheck.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Get user's subscription
    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      status: 'active'
    }).lean();

    // Format the user data
    const userData = {
      _id: user._id,
      email: user.email,
      startupName: user.startupName,
      founderName: user.founderName,
      city: user.city,
      state: user.state,
      country: user.country,
      website: user.website,
      contactNumber: user.contactNumber,
      subscription: subscription || { type: 'free', isActive: false },
      memberSince: user.createdAt
    };

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        report: healthCheck
      }
    });

  } catch (error) {
    console.error('Report detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report details',
      error: error.message
    });
  }
});

module.exports = router;