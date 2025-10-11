const express = require('express');
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const Subscription = require('../models/Subscription');
const { verifyFirebaseToken, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/dashboard - Get user dashboard data
router.get('/dashboard', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;

    // Get health check stats from separate collection
    const totalHealthChecks = await HealthCheck.countDocuments({ userId: user._id });
    const latestHealthCheck = await HealthCheck.getLatestForUser(user._id);
    
    // Calculate average score if health checks exist
    let averageScore = 0;
    if (totalHealthChecks > 0) {
      const healthChecks = await HealthCheck.find({ userId: user._id }).select('score');
      const totalScore = healthChecks.reduce((sum, result) => sum + (result.score || 0), 0);
      averageScore = Math.round(totalScore / totalHealthChecks);
    }

    // Get subscription from separate collection
    const subscription = await Subscription.getActiveForUser(user._id);

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
          subscription: subscription ? {
            type: subscription.type,
            isActive: subscription.isActive,
            startDate: subscription.startDate,
            endDate: subscription.endDate
          } : {
            type: 'free',
            isActive: true,
            startDate: user.createdAt
          },
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

    // Get or create subscription
    let subscription = await Subscription.getActiveForUser(user._id);
    
    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        firebaseUid: user.firebaseUid,
        type: 'free',
        startDate: new Date(),
        isActive: true,
        status: 'active'
      });
    }

    subscription.type = type;
    subscription.isActive = true;
    subscription.status = 'active';

    if (endDate) {
      subscription.endDate = new Date(endDate);
    }

    // Update features based on subscription type
    if (type === 'premium') {
      subscription.features.healthChecksPerMonth = 10;
      subscription.features.detailedReports = true;
      subscription.features.customRecommendations = true;
    } else if (type === 'enterprise') {
      subscription.features.healthChecksPerMonth = 999;
      subscription.features.detailedReports = true;
      subscription.features.prioritySupport = true;
      subscription.features.customRecommendations = true;
      subscription.features.apiAccess = true;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: {
          type: subscription.type,
          isActive: subscription.isActive,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: subscription.features
        }
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

    // Get subscription from separate collection
    const subscription = await Subscription.getActiveForUser(user._id);

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
          subscription: subscription ? {
            type: subscription.type,
            isActive: subscription.isActive,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            features: subscription.features,
            usage: subscription.usage
          } : {
            type: 'free',
            isActive: true,
            startDate: user.createdAt
          },
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