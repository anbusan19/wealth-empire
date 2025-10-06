const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/onboarding/complete - Complete user onboarding
router.post('/complete', verifyFirebaseToken, [
  body('startupName').notEmpty().trim().withMessage('Startup name is required'),
  body('city').notEmpty().trim().withMessage('City is required'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('country').notEmpty().trim().withMessage('Country is required'),
  body('founderName').notEmpty().trim().withMessage('Founder name is required'),
  body('contactNumber').notEmpty().trim().withMessage('Contact number is required'),
  body('website').optional().trim().isURL().withMessage('Website must be a valid URL')
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

    const {
      startupName,
      city,
      state,
      country,
      website,
      founderName,
      contactNumber
    } = req.body;

    const user = req.user;

    // Update user profile
    user.startupName = startupName;
    user.city = city;
    user.state = state;
    user.country = country;
    user.website = website || null;
    user.founderName = founderName;
    user.contactNumber = contactNumber;

    // Complete onboarding
    await user.completeOnboarding();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
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
          profileCompletedAt: user.profileCompletedAt
        }
      }
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
});

// GET /api/onboarding/status - Check onboarding status
router.get('/status', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      isOnboarded: user.isOnboardingComplete,
      data: {
        isOnboardingComplete: user.isOnboardingComplete,
        profileCompletedAt: user.profileCompletedAt,
        user: {
          startupName: user.startupName,
          city: user.city,
          state: user.state,
          country: user.country,
          website: user.website,
          founderName: user.founderName,
          contactNumber: user.contactNumber
        }
      }
    });

  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding status',
      error: error.message
    });
  }
});

// PATCH /api/onboarding/update - Update user profile
router.patch('/update', verifyFirebaseToken, [
  body('startupName').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('founderName').optional().trim(),
  body('contactNumber').optional().trim(),
  body('website').optional().trim().isURL().withMessage('Website must be a valid URL')
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

    const user = req.user;
    const updateFields = req.body;

    // Update only provided fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        user[key] = updateFields[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
          isOnboardingComplete: user.isOnboardingComplete
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;