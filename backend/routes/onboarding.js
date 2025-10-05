const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate Firebase token (simplified)
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract user info from request body (in production, verify Firebase token)
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

// Complete onboarding
router.post('/complete',
  [
    body('startupName').notEmpty().trim().withMessage('Startup name is required'),
    body('city').notEmpty().trim().withMessage('City is required'),
    body('state').notEmpty().trim().withMessage('State is required'),
    body('country').optional().trim(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('founderName').notEmpty().trim().withMessage('Founder name is required'),
    body('contactNumber').notEmpty().trim().withMessage('Contact number is required')
      .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid contact number'),
  ],
  authenticateFirebaseToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        startupName,
        city,
        state,
        country = 'India',
        website,
        founderName,
        contactNumber,
        firebaseUid
      } = req.body;

      // Find user by Firebase UID
      const user = await User.findByFirebaseUid(firebaseUid || req.user.uid);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user with onboarding data
      user.startupName = startupName;
      user.city = city;
      user.state = state;
      user.country = country;
      user.website = website;
      user.founderName = founderName;
      user.contactNumber = contactNumber;
      user.isOnboarded = true;

      await user.save();

      res.json({
        message: 'Onboarding completed successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isOnboarded: user.isOnboarded,
          hasCompletedOnboarding: user.hasCompletedOnboarding(),
          startupName: user.startupName,
          city: user.city,
          state: user.state,
          country: user.country,
          website: user.website,
          founderName: user.founderName,
          contactNumber: user.contactNumber
        }
      });

    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({ message: 'Server error during onboarding' });
    }
  }
);

// Get onboarding status
router.get('/status', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      isOnboarded: user.isOnboarded,
      hasCompletedOnboarding: user.hasCompletedOnboarding(),
      completedFields: {
        startupName: !!user.startupName,
        city: !!user.city,
        state: !!user.state,
        country: !!user.country,
        website: !!user.website,
        founderName: !!user.founderName,
        contactNumber: !!user.contactNumber
      }
    });

  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).json({ message: 'Server error fetching onboarding status' });
  }
});

// Update onboarding data (partial update)
router.patch('/update',
  [
    body('startupName').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country').optional().trim(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('founderName').optional().trim(),
    body('contactNumber').optional().trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid contact number'),
  ],
  authenticateFirebaseToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByFirebaseUid(req.user.uid);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update only provided fields
      const updateFields = [
        'startupName', 'city', 'state', 'country',
        'website', 'founderName', 'contactNumber'
      ];

      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      // Check if onboarding is now complete
      if (user.hasCompletedOnboarding()) {
        user.isOnboarded = true;
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          isOnboarded: user.isOnboarded,
          hasCompletedOnboarding: user.hasCompletedOnboarding(),
          startupName: user.startupName,
          city: user.city,
          state: user.state,
          country: user.country,
          website: user.website,
          founderName: user.founderName,
          contactNumber: user.contactNumber
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }
);

module.exports = router;