const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, we'll use a simple JWT verification
const jwt = require('jsonwebtoken');

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // For development, we'll use a simple approach
    // In production, you should verify the Firebase token properly
    try {
      // Decode the Firebase token (without verification for development)
      const decoded = jwt.decode(token);
      
      if (!decoded || (!decoded.user_id && !decoded.uid)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Firebase tokens can have either 'user_id' or 'uid'
      const firebaseUid = decoded.user_id || decoded.uid;
      
      // Find user by Firebase UID
      const user = await User.findByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please complete registration.',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      req.firebaseUid = firebaseUid;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if onboarding is complete
const requireOnboarding = (req, res, next) => {
  if (!req.user.isOnboardingComplete) {
    return res.status(403).json({
      success: false,
      message: 'Onboarding not completed',
      redirectTo: '/onboarding'
    });
  }
  next();
};

module.exports = {
  verifyFirebaseToken,
  requireOnboarding
};