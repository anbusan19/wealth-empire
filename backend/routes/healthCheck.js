const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
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

    // Create health check result
    const healthCheckResult = {
      assessmentDate: new Date(),
      answers: new Map(Object.entries(answers)),
      score: parseFloat(score),
      recommendations,
      strengths,
      redFlags,
      risks,
      followUpAnswers: new Map(Object.entries(followUpAnswers))
    };

    // Add to user's health check results
    await user.addHealthCheckResult(healthCheckResult);

    res.status(201).json({
      success: true,
      message: 'Health check results saved successfully',
      data: {
        result: {
          assessmentDate: healthCheckResult.assessmentDate,
          score: healthCheckResult.score,
          recommendations: healthCheckResult.recommendations,
          strengths: healthCheckResult.strengths,
          redFlags: healthCheckResult.redFlags,
          risks: healthCheckResult.risks,
          totalAssessments: user.healthCheckResults.length
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

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const history = user.healthCheckResults
      .slice()
      .reverse() // Most recent first
      .slice(startIndex, endIndex)
      .map(result => ({
        assessmentDate: result.assessmentDate,
        score: result.score,
        recommendations: result.recommendations,
        strengths: result.strengths || [],
        redFlags: result.redFlags || [],
        risks: result.risks || [],
        answersCount: result.answers ? result.answers.size : 0,
        followUpAnswersCount: result.followUpAnswers ? result.followUpAnswers.size : 0
      }));

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalResults: user.healthCheckResults.length,
          totalPages: Math.ceil(user.healthCheckResults.length / limit),
          hasNext: endIndex < user.healthCheckResults.length,
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
    const latestResult = user.latestHealthCheck;

    if (!latestResult) {
      return res.status(404).json({
        success: false,
        message: 'No health check results found'
      });
    }

    // Convert Maps to Objects for JSON response
    const result = {
      assessmentDate: latestResult.assessmentDate,
      answers: Object.fromEntries(latestResult.answers || new Map()),
      score: latestResult.score,
      recommendations: latestResult.recommendations,
      strengths: latestResult.strengths || [],
      redFlags: latestResult.redFlags || [],
      risks: latestResult.risks || [],
      followUpAnswers: Object.fromEntries(latestResult.followUpAnswers || new Map())
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
    const results = user.healthCheckResults;

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAssessments: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          lastAssessment: null,
          trend: 'no-data'
        }
      });
    }

    const scores = results.map(r => r.score).filter(s => s !== undefined);
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

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        lastAssessment,
        trend
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