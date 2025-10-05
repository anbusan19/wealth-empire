const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate Firebase token (simplified)
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    req.user = {
      uid: req.body.firebaseUid || req.headers['x-firebase-uid'],
      email: req.body.email || req.headers['x-user-email']
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user dashboard data
router.get('/dashboard', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const latestHealthCheck = user.getLatestHealthCheck();
    const totalHealthChecks = user.healthCheckResults.length;

    // Calculate average score
    let averageScore = 0;
    if (totalHealthChecks > 0) {
      const totalScore = user.healthCheckResults.reduce((sum, result) => sum + result.overallScore, 0);
      averageScore = Math.round(totalScore / totalHealthChecks);
    }

    // Get score trend (last 5 results)
    const recentResults = user.healthCheckResults.slice(-5);
    const scoreTrend = recentResults.map(result => ({
      date: result.completedAt,
      score: result.overallScore
    }));

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        startupName: user.startupName,
        subscriptionPlan: user.subscriptionPlan,
        isOnboarded: user.isOnboarded,
        hasCompletedOnboarding: user.hasCompletedOnboarding()
      },
      stats: {
        totalHealthChecks,
        averageScore,
        latestScore: latestHealthCheck?.overallScore || 0,
        lastCheckDate: latestHealthCheck?.completedAt || null,
        scoreTrend
      },
      latestHealthCheck: latestHealthCheck ? {
        id: latestHealthCheck._id,
        completedAt: latestHealthCheck.completedAt,
        overallScore: latestHealthCheck.overallScore,
        categoryScores: latestHealthCheck.categoryScores,
        strengths: latestHealthCheck.strengths?.slice(0, 3) || [], // Top 3 strengths
        redFlags: latestHealthCheck.redFlags?.slice(0, 3) || [], // Top 3 red flags
        risks: latestHealthCheck.risks?.slice(0, 3) || [] // Top 3 risks
      } : null
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Update user subscription
router.patch('/subscription', authenticateFirebaseToken, async (req, res) => {
  try {
    const { subscriptionPlan, subscriptionStatus } = req.body;
    
    const validPlans = ['free', 'essentials', 'elite', 'white-label'];
    const validStatuses = ['active', 'inactive', 'trial', 'expired'];

    if (subscriptionPlan && !validPlans.includes(subscriptionPlan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    if (subscriptionStatus && !validStatuses.includes(subscriptionStatus)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }

    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;

    await user.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription: {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus
      }
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ message: 'Server error updating subscription' });
  }
});

// Get user statistics (admin endpoint - would need proper admin auth in production)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onboardedUsers = await User.countDocuments({ isOnboarded: true });
    const usersWithHealthChecks = await User.countDocuments({ 
      'healthCheckResults.0': { $exists: true } 
    });

    // Subscription distribution
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalUsers,
      onboardedUsers,
      usersWithHealthChecks,
      onboardingRate: totalUsers > 0 ? Math.round((onboardedUsers / totalUsers) * 100) : 0,
      healthCheckRate: onboardedUsers > 0 ? Math.round((usersWithHealthChecks / onboardedUsers) * 100) : 0,
      recentSignups,
      subscriptionDistribution: subscriptionStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;