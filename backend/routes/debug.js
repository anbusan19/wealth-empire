const express = require('express');
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const Subscription = require('../models/Subscription');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

// Only enable debug routes in development
if (process.env.NODE_ENV === 'development') {
  
  // GET /api/debug/user-info - Get detailed user info for debugging
  router.get('/user-info', verifyFirebaseToken, async (req, res) => {
    try {
      const user = req.user;
      const subscription = await Subscription.getActiveForUser(user._id);
      const healthCheckCount = await HealthCheck.countDocuments({ userId: user._id });
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firebaseUid: user.firebaseUid,
            createdAt: user.createdAt
          },
          subscription: subscription ? {
            type: subscription.type,
            isActive: subscription.isActive,
            status: subscription.status,
            features: subscription.features,
            usage: subscription.usage,
            canUseHealthCheck: subscription.canUseHealthCheck()
          } : null,
          healthCheckCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Debug info failed',
        error: error.message
      });
    }
  });

  // POST /api/debug/reset-usage - Reset health check usage for testing
  router.post('/reset-usage', verifyFirebaseToken, async (req, res) => {
    try {
      const user = req.user;
      const subscription = await Subscription.getActiveForUser(user._id);
      
      if (subscription) {
        subscription.usage.healthChecksUsed = 0;
        subscription.usage.lastResetDate = new Date();
        await subscription.save();
        
        res.json({
          success: true,
          message: 'Usage reset successfully',
          data: {
            usage: subscription.usage
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No subscription found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Reset failed',
        error: error.message
      });
    }
  });

  // POST /api/debug/create-subscription - Create subscription for user
  router.post('/create-subscription', verifyFirebaseToken, async (req, res) => {
    try {
      const user = req.user;
      
      // Check if subscription already exists
      const existingSubscription = await Subscription.getActiveForUser(user._id);
      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          message: 'Subscription already exists'
        });
      }
      
      // Create new subscription
      const subscription = new Subscription({
        userId: user._id,
        firebaseUid: user.firebaseUid,
        type: 'free',
        startDate: new Date(),
        isActive: true,
        status: 'active'
      });
      
      await subscription.save();
      
      res.json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          subscription: {
            type: subscription.type,
            features: subscription.features,
            usage: subscription.usage
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Subscription creation failed',
        error: error.message
      });
    }
  });
}

module.exports = router;