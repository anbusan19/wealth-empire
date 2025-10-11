const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const Subscription = require('../models/Subscription');
const { verifyFirebaseToken, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// POST /api/health-check/save-results - Save health check assessment results
router.post('/save-results', verifyFirebaseToken, requireOnboarding, [
  body('answers').isObject().withMessage('Answers must be an object'),
  body('score').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('recommendations').optional().isArray().withMessage('Recommendations must be an array'),
  body('strengths').optional().isArray().withMessage('Strengths must be an array'),
  body('redFlags').optional().isArray().withMessage('Red flags must be an array'),
  body('risks').optional().isArray().withMessage('Risks must be an array'),
  body('followUpAnswers').optional().isObject().withMessage('Follow-up answers must be an object')
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
      answers, 
      score, 
      recommendations = [], 
      strengths = [],
      redFlags = [],
      risks = [],
      followUpAnswers = {} 
    } = req.body;
    const user = req.user;

    // Get or create subscription (for tracking purposes, but no limits enforced)
    let subscription = await Subscription.getActiveForUser(user._id);
    
    // If no subscription exists, create a default free subscription
    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        firebaseUid: user.firebaseUid,
        type: 'free',
        startDate: new Date(),
        isActive: true,
        status: 'active'
      });
      await subscription.save();
    }
    
    // Note: Health check limits are disabled - users can perform unlimited health checks

    // Create new health check record
    const healthCheck = new HealthCheck({
      userId: user._id,
      firebaseUid: user.firebaseUid,
      answers: new Map(Object.entries(answers)),
      followUpAnswers: new Map(Object.entries(followUpAnswers)),
      score: parseFloat(score),
      recommendations,
      strengths,
      redFlags,
      risks
    });

    await healthCheck.save();

    // Update subscription usage (for tracking only, no limits enforced)
    await subscription.incrementUsage('healthCheck');

    // Get total assessments count
    const totalAssessments = await HealthCheck.countDocuments({ userId: user._id });

    res.status(201).json({
      success: true,
      message: 'Health check results saved successfully',
      data: {
        result: {
          id: healthCheck._id,
          assessmentDate: healthCheck.assessmentDate,
          score: healthCheck.score,
          recommendations: healthCheck.recommendations,
          strengths: healthCheck.strengths,
          redFlags: healthCheck.redFlags,
          risks: healthCheck.risks,
          riskLevel: healthCheck.riskLevel,
          totalAssessments
        }
      }
    });

  } catch (error) {
    console.error('Save health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save health check results',
      error: error.message
    });
  }
});

// GET /api/health-check/history - Get user's health check history
router.get('/history', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;
    const totalResults = await HealthCheck.countDocuments({ userId: user._id });

    const history = await HealthCheck.find({ userId: user._id })
      .sort({ assessmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('assessmentDate score recommendations strengths redFlags risks answers followUpAnswers riskLevel')
      .lean();

    const formattedHistory = history.map(result => ({
      id: result._id,
      assessmentDate: result.assessmentDate,
      score: result.score,
      riskLevel: result.riskLevel,
      recommendations: result.recommendations || [],
      strengths: result.strengths || [],
      redFlags: result.redFlags || [],
      risks: result.risks || [],
      answersCount: result.answers ? Object.keys(result.answers).length : 0,
      followUpAnswersCount: result.followUpAnswers ? Object.keys(result.followUpAnswers).length : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          currentPage: parseInt(page),
          totalResults,
          totalPages: Math.ceil(totalResults / limit),
          hasNext: skip + parseInt(limit) < totalResults,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get health check history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health check history',
      error: error.message
    });
  }
});

// GET /api/health-check/latest - Get latest health check result
router.get('/latest', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;
    const latestResult = await HealthCheck.getLatestForUser(user._id);

    if (!latestResult) {
      return res.status(404).json({
        success: false,
        message: 'No health check results found'
      });
    }

    // Get improvement data
    const improvement = await latestResult.getImprovement();

    // Convert Maps to Objects for JSON response
    const result = {
      id: latestResult._id,
      assessmentDate: latestResult.assessmentDate,
      answers: Object.fromEntries(latestResult.answers || new Map()),
      score: latestResult.score,
      riskLevel: latestResult.riskLevel,
      recommendations: latestResult.recommendations,
      strengths: latestResult.strengths || [],
      redFlags: latestResult.redFlags || [],
      risks: latestResult.risks || [],
      followUpAnswers: Object.fromEntries(latestResult.followUpAnswers || new Map()),
      improvement
    };

    res.status(200).json({
      success: true,
      data: {
        result
      }
    });

  } catch (error) {
    console.error('Get latest health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get latest health check result',
      error: error.message
    });
  }
});

// GET /api/health-check/stats - Get health check statistics
router.get('/stats', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;
    
    // Get all health checks for the user
    const results = await HealthCheck.find({ userId: user._id })
      .sort({ assessmentDate: 1 })
      .select('score assessmentDate')
      .lean();

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAssessments: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          lastAssessment: null,
          trend: 'no-data',
          riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 }
        }
      });
    }

    const scores = results.map(r => r.score);
    const totalAssessments = results.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const lastAssessment = results[results.length - 1].assessmentDate;

    // Calculate trend (comparing last 2 assessments)
    let trend = 'stable';
    if (scores.length >= 2) {
      const lastScore = scores[scores.length - 1];
      const previousScore = scores[scores.length - 2];
      if (lastScore > previousScore) trend = 'improving';
      else if (lastScore < previousScore) trend = 'declining';
    }

    // Calculate risk distribution
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    scores.forEach(score => {
      if (score >= 80) riskDistribution.low++;
      else if (score >= 60) riskDistribution.medium++;
      else if (score >= 40) riskDistribution.high++;
      else riskDistribution.critical++;
    });

    // Get subscription info
    const subscription = await Subscription.getActiveForUser(user._id);

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        lastAssessment,
        trend,
        riskDistribution,
        subscription: {
          type: subscription?.type || 'free',
          healthChecksRemaining: 'unlimited' // No limits enforced
        }
      }
    });

  } catch (error) {
    console.error('Get health check stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health check statistics',
      error: error.message
    });
  }
});

module.exports = router;