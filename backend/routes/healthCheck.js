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

// Save health check results
router.post('/save-results',
  [
    body('overallScore').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Overall score must be between 0 and 100'),
    body('categoryScores').isArray().withMessage('Category scores must be an array'),
    body('answers').isObject().withMessage('Answers must be an object'),
    body('followUpAnswers').optional().isObject().withMessage('Follow-up answers must be an object'),
    body('strengths').optional().isArray().withMessage('Strengths must be an array'),
    body('redFlags').optional().isArray().withMessage('Red flags must be an array'),
    body('risks').optional().isArray().withMessage('Risks must be an array')
  ],
  authenticateFirebaseToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        overallScore,
        categoryScores,
        answers,
        followUpAnswers = {},
        strengths = [],
        redFlags = [],
        risks = [],
        firebaseUid
      } = req.body;

      const user = await User.findByFirebaseUid(firebaseUid || req.user.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has completed onboarding
      if (!user.hasCompletedOnboarding()) {
        return res.status(400).json({ 
          message: 'Please complete onboarding before taking the health check',
          requiresOnboarding: true
        });
      }

      // Create new health check result
      const healthCheckResult = {
        completedAt: new Date(),
        overallScore,
        categoryScores,
        answers: new Map(Object.entries(answers)),
        followUpAnswers: new Map(Object.entries(followUpAnswers)),
        strengths,
        redFlags,
        risks
      };

      // Add to user's health check history
      user.healthCheckResults.push(healthCheckResult);

      // Keep only last 10 results to prevent document from growing too large
      if (user.healthCheckResults.length > 10) {
        user.healthCheckResults = user.healthCheckResults.slice(-10);
      }

      await user.save();

      res.json({
        message: 'Health check results saved successfully',
        resultId: healthCheckResult._id,
        overallScore,
        completedAt: healthCheckResult.completedAt
      });

    } catch (error) {
      console.error('Health check save error:', error);
      res.status(500).json({ message: 'Server error saving health check results' });
    }
  }
);

// Get health check history
router.get('/history', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const history = user.healthCheckResults.map(result => ({
      id: result._id,
      completedAt: result.completedAt,
      overallScore: result.overallScore,
      categoryScores: result.categoryScores,
      strengths: result.strengths,
      redFlags: result.redFlags,
      risks: result.risks
    }));

    res.json({
      history,
      totalResults: history.length,
      latestResult: history.length > 0 ? history[history.length - 1] : null
    });

  } catch (error) {
    console.error('Health check history error:', error);
    res.status(500).json({ message: 'Server error fetching health check history' });
  }
});

// Get latest health check result
router.get('/latest', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const latestResult = user.getLatestHealthCheck();

    if (!latestResult) {
      return res.json({ 
        message: 'No health check results found',
        hasResults: false
      });
    }

    res.json({
      hasResults: true,
      result: {
        id: latestResult._id,
        completedAt: latestResult.completedAt,
        overallScore: latestResult.overallScore,
        categoryScores: latestResult.categoryScores,
        answers: Object.fromEntries(latestResult.answers),
        followUpAnswers: Object.fromEntries(latestResult.followUpAnswers),
        strengths: latestResult.strengths,
        redFlags: latestResult.redFlags,
        risks: latestResult.risks
      }
    });

  } catch (error) {
    console.error('Latest health check error:', error);
    res.status(500).json({ message: 'Server error fetching latest health check' });
  }
});

// Delete health check result
router.delete('/result/:resultId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { resultId } = req.params;
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the specific result
    user.healthCheckResults = user.healthCheckResults.filter(
      result => result._id.toString() !== resultId
    );

    await user.save();

    res.json({ message: 'Health check result deleted successfully' });

  } catch (error) {
    console.error('Delete health check error:', error);
    res.status(500).json({ message: 'Server error deleting health check result' });
  }
});

module.exports = router;