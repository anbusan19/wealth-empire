const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/firebase-auth - Register or login user after Firebase authentication
router.post('/firebase-auth', [
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('startupName').optional().trim(),
  body('founderName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firebaseUid, email, startupName, founderName } = req.body;

    // Check if user already exists
    let user = await User.findByFirebaseUid(firebaseUid);

    if (user) {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            startupName: user.startupName,
            founderName: user.founderName,
            isOnboardingComplete: user.isOnboardingComplete
          }
        }
      });
    }

    // Create new user (minimal data for now)
    user = new User({
      firebaseUid,
      email,
      startupName: startupName || 'Unnamed Startup',
      founderName: founderName || 'Unknown Founder',
      city: 'Not specified',
      state: 'Not specified',
      country: 'Not specified',
      contactNumber: 'Not specified',
      isOnboardingComplete: false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          startupName: user.startupName,
          founderName: user.founderName,
          isOnboardingComplete: user.isOnboardingComplete
        }
      }
    });

  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration/login failed',
      error: error.message
    });
  }
});

// GET /api/auth/profile - Get user profile
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
          lastLoginAt: user.lastLoginAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

module.exports = router;