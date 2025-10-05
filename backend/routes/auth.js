const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate Firebase token (simplified for now)
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // In a real implementation, you would verify the Firebase token here
    // For now, we'll extract the user info from the request body
    // This should be replaced with proper Firebase Admin SDK verification
    
    req.user = {
      uid: req.body.firebaseUid || req.body.uid,
      email: req.body.email,
      displayName: req.body.displayName
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register or login user after Firebase authentication
router.post('/firebase-auth', 
  [
    body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  authenticateFirebaseToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firebaseUid, email, displayName } = req.body;

      // Check if user already exists
      let user = await User.findByFirebaseUid(firebaseUid);

      if (user) {
        // Update last login
        user.lastLoginAt = new Date();
        if (displayName && !user.displayName) {
          user.displayName = displayName;
        }
        await user.save();
        
        return res.json({
          message: 'User logged in successfully',
          user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            isOnboarded: user.isOnboarded,
            hasCompletedOnboarding: user.hasCompletedOnboarding(),
            subscriptionPlan: user.subscriptionPlan
          }
        });
      }

      // Create new user
      user = new User({
        firebaseUid,
        email,
        displayName,
        lastLoginAt: new Date()
      });

      await user.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isOnboarded: user.isOnboarded,
          hasCompletedOnboarding: user.hasCompletedOnboarding(),
          subscriptionPlan: user.subscriptionPlan
        }
      });

    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(500).json({ message: 'Server error during authentication' });
    }
  }
);

// Get current user profile
router.get('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        isOnboarded: user.isOnboarded,
        hasCompletedOnboarding: user.hasCompletedOnboarding(),
        subscriptionPlan: user.subscriptionPlan,
        startupName: user.startupName,
        city: user.city,
        state: user.state,
        country: user.country,
        website: user.website,
        founderName: user.founderName,
        contactNumber: user.contactNumber,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;