const express = require('express');
const User = require('../models/User');
const { verifyFirebaseToken, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/dashboard - Get user dashboard data
router.get('/dashboard', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;

    // Get user stats
    const totalHealthChecks = user.healthCheckResults.length;
    const latestHealthCheck = user.latestHealthCheck;

    // Calculate average score if health checks exist
    let averageScore = 0;
    if (totalHealthChecks > 0) {
      const totalScore = user.healthCheckResults.reduce((sum, result) => sum + (result.score || 0), 0);
      averageScore = Math.round(totalScore / totalHealthChecks);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          startupName: user.startupName,
          founderName: user.founderName,
          city: user.city,
          state: user.state,
          country: user.country,
          website: user.website,
          contactNumber: user.contactNumber,
          subscription: user.subscription,
          memberSince: user.createdAt
        },
        stats: {
          totalHealthChecks,
          averageScore,
          lastAssessment: latestHealthCheck?.assessmentDate || null,
          lastScore: latestHealthCheck?.score || null
        },
        latestHealthCheck: latestHealthCheck ? {
          date: latestHealthCheck.assessmentDate,
          score: latestHealthCheck.score,
          recommendations: latestHealthCheck.recommendations
        } : null
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// PATCH /api/users/subscription - Update user subscription
router.patch('/subscription', verifyFirebaseToken, async (req, res) => {
  try {
    const { type, endDate } = req.body;
    const user = req.user;

    if (!['free', 'premium', 'enterprise'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription type'
      });
    }

    user.subscription.type = type;
    user.subscription.isActive = true;

    if (endDate) {
      user.subscription.endDate = new Date(endDate);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

// GET /api/users/profile - Get detailed user profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          startupName: user.startupName,
          city: user.city,
          state: user.state,
          country: user.country,
          website: user.website,
          founderName: user.founderName,
          contactNumber: user.contactNumber,
          isOnboardingComplete: user.isOnboardingComplete,
          subscription: user.subscription,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          profileCompletedAt: user.profileCompletedAt
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

module.exports = router;