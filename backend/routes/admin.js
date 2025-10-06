const express = require('express');
const User = require('../models/User');

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

    // Get total health checks across all users
    const healthCheckStats = await User.aggregate([
      { $unwind: { path: '$healthCheckResults', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalHealthChecks: { $sum: { $cond: [{ $ifNull: ['$healthCheckResults', false] }, 1, 0] } },
          totalScore: { $sum: { $ifNull: ['$healthCheckResults.score', 0] } },
          scoresCount: { $sum: { $cond: [{ $ne: ['$healthCheckResults.score', null] }, 1, 0] } }
        }
      }
    ]);

    const healthCheckData = healthCheckStats[0] || { totalHealthChecks: 0, totalScore: 0, scoresCount: 0 };
    const averageComplianceScore = healthCheckData.scoresCount > 0 
      ? Math.round(healthCheckData.totalScore / healthCheckData.scoresCount) 
      : 0;

    // Get active subscriptions count
    const activeSubscriptions = await User.countDocuments({
      'subscription.isActive': true,
      'subscription.type': { $ne: 'free' }
    });

    // Calculate total revenue (mock calculation - adjust based on your pricing)
    const subscriptionRevenue = await User.aggregate([
      {
        $match: {
          'subscription.isActive': true,
          'subscription.type': { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: '$subscription.type',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalRevenue = 0;
    subscriptionRevenue.forEach(sub => {
      if (sub._id === 'premium') totalRevenue += sub.count * 5000; // ₹5000 per premium
      if (sub._id === 'enterprise') totalRevenue += sub.count * 15000; // ₹15000 per enterprise
    });

    // Get users with critical issues (score < 50)
    const criticalIssues = await User.countDocuments({
      'healthCheckResults.score': { $lt: 50 }
    });

    // Calculate completion rate
    const usersWithHealthChecks = await User.countDocuments({
      healthCheckResults: { $exists: true, $ne: [] }
    });
    const completionRate = totalUsers > 0 ? Math.round((usersWithHealthChecks / totalUsers) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalHealthChecks: healthCheckData.totalHealthChecks,
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
      .select('email startupName createdAt lastLoginAt subscription healthCheckResults')
      .lean();

    const formattedUsers = recentUsers.map(user => ({
      id: user._id,
      email: user.email,
      startupName: user.startupName,
      joinDate: user.createdAt,
      lastHealthCheck: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].assessmentDate 
        : null,
      complianceScore: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].score 
        : null,
      subscriptionPlan: user.subscription.type === 'free' ? 'Free' : 
                       user.subscription.type === 'premium' ? 'Elite' : 'Enterprise'
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
    const recentHealthChecks = await User.aggregate([
      { $unwind: '$healthCheckResults' },
      {
        $project: {
          email: 1,
          startupName: 1,
          healthCheck: '$healthCheckResults'
        }
      },
      { $sort: { 'healthCheck.assessmentDate': -1 } },
      { $limit: 10 }
    ]);

    const formattedHealthChecks = recentHealthChecks.map(item => ({
      id: `${item._id}_${item.healthCheck.assessmentDate}`,
      userEmail: item.email,
      startupName: item.startupName,
      score: item.healthCheck.score || 0,
      completedAt: item.healthCheck.assessmentDate,
      criticalIssues: item.healthCheck.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0 // Mock critical issues count
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

    if (subscription !== 'all') {
      query['subscription.type'] = subscription;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('email startupName founderName city state country website contactNumber subscription createdAt lastLoginAt healthCheckResults isOnboardingComplete')
      .lean();

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const formattedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      startupName: user.startupName,
      founderName: user.founderName,
      city: user.city,
      state: user.state,
      country: user.country,
      website: user.website,
      contactNumber: user.contactNumber,
      subscriptionPlan: user.subscription.type === 'free' ? 'Free' : 
                       user.subscription.type === 'premium' ? 'Elite' : 'Enterprise',
      subscriptionStatus: user.subscription.isActive ? 'Active' : 'Inactive',
      isOnboarded: user.isOnboardingComplete,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      lastHealthCheck: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].assessmentDate 
        : null,
      complianceScore: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].score 
        : null,
      totalHealthChecks: user.healthCheckResults ? user.healthCheckResults.length : 0,
      status: user.subscription.isActive ? 'Active' : 'Inactive'
    }));

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
      subscriptionPlan: user.subscription.type === 'free' ? 'Free' : 
                       user.subscription.type === 'premium' ? 'Elite' : 'Enterprise',
      subscriptionStatus: user.subscription.isActive ? 'Active' : 'Inactive',
      subscriptionStartDate: user.subscription.startDate,
      subscriptionEndDate: user.subscription.endDate,
      isOnboarded: user.isOnboardingComplete,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      lastHealthCheck: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].assessmentDate 
        : null,
      complianceScore: user.healthCheckResults && user.healthCheckResults.length > 0 
        ? user.healthCheckResults[user.healthCheckResults.length - 1].score 
        : null,
      totalHealthChecks: user.healthCheckResults ? user.healthCheckResults.length : 0,
      status: user.subscription.isActive ? 'Active' : 'Inactive',
      totalRevenue: user.subscription.type === 'premium' ? 5000 : 
                   user.subscription.type === 'enterprise' ? 15000 : 0,
      healthCheckHistory: user.healthCheckResults ? user.healthCheckResults.map((check, index) => ({
        id: `${user._id}_${index}`,
        date: check.assessmentDate,
        score: check.score || 0,
        criticalIssues: check.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0,
        recommendations: check.recommendations || []
      })) : []
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

    // Get reports (health checks) from all users
    const reports = await User.aggregate([
      { $unwind: { path: '$healthCheckResults', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...(search && {
            $or: [
              { startupName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }),
          ...(status === 'completed' && { 'healthCheckResults.score': { $exists: true } }),
          ...(status === 'failed' && { 'healthCheckResults.score': { $lt: 50 } })
        }
      },
      {
        $project: {
          email: 1,
          startupName: 1,
          healthCheck: '$healthCheckResults',
          hasHealthCheck: { $cond: [{ $ifNull: ['$healthCheckResults', false] }, true, false] }
        }
      },
      { $sort: { 'healthCheck.assessmentDate': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    const totalReports = await User.aggregate([
      { $unwind: { path: '$healthCheckResults', preserveNullAndEmptyArrays: true } },
      { $count: 'total' }
    ]);

    const formattedReports = reports.map(item => ({
      id: item.healthCheck ? `${item._id}_${item.healthCheck.assessmentDate}` : `${item._id}_pending`,
      userId: item._id.toString(),
      userEmail: item.email,
      startupName: item.startupName,
      score: item.healthCheck?.score || 0,
      completedAt: item.healthCheck?.assessmentDate || new Date(),
      criticalIssues: item.healthCheck?.score < 50 ? Math.floor(Math.random() * 5) + 1 : 0,
      status: item.healthCheck ? 'Completed' : 'In Progress',
      categories: {
        legal: item.healthCheck?.score ? Math.floor(Math.random() * 20) + 80 : 0,
        financial: item.healthCheck?.score ? Math.floor(Math.random() * 20) + 70 : 0,
        operational: item.healthCheck?.score ? Math.floor(Math.random() * 20) + 75 : 0,
        regulatory: item.healthCheck?.score ? Math.floor(Math.random() * 20) + 85 : 0
      }
    }));

    // Get report statistics
    const statsData = await User.aggregate([
      { $unwind: { path: '$healthCheckResults', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: { $cond: [{ $ifNull: ['$healthCheckResults', false] }, 1, 0] } },
          totalScore: { $sum: { $ifNull: ['$healthCheckResults.score', 0] } },
          scoresCount: { $sum: { $cond: [{ $ne: ['$healthCheckResults.score', null] }, 1, 0] } },
          criticalIssues: { $sum: { $cond: [{ $lt: ['$healthCheckResults.score', 50] }, 1, 0] } }
        }
      }
    ]);

    const stats = statsData[0] || { totalReports: 0, totalScore: 0, scoresCount: 0, criticalIssues: 0 };
    const averageScore = stats.scoresCount > 0 ? Math.round(stats.totalScore / stats.scoresCount) : 0;

    // Get this month's completed reports
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await User.aggregate([
      { $unwind: '$healthCheckResults' },
      { $match: { 'healthCheckResults.assessmentDate': { $gte: startOfMonth } } },
      { $count: 'total' }
    ]);

    const reportStats = {
      totalReports: stats.totalReports,
      averageScore,
      criticalIssues: stats.criticalIssues,
      completedThisMonth: completedThisMonth[0]?.total || 0,
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
          totalPages: Math.ceil((totalReports[0]?.total || 0) / limit),
          totalReports: totalReports[0]?.total || 0
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

module.exports = router;