const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const { verifyFirebaseToken, requireOnboarding } = require('../middleware/auth');

const router = express.Router();

// In-memory storage for shareable reports (in production, use Redis or database)
const shareableReports = new Map();

// POST /api/shareable-reports/create - Create a shareable report
router.post('/create', verifyFirebaseToken, requireOnboarding, [
  body('healthCheckId').notEmpty().withMessage('Health check ID is required'),
  body('expiresInDays').optional().isInt({ min: 1, max: 365 }).withMessage('Expires in days must be between 1 and 365')
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

    const { healthCheckId, expiresInDays = 30 } = req.body;
    const user = req.user;

    // Verify the health check belongs to the user
    const healthCheck = await HealthCheck.findOne({
      _id: healthCheckId,
      userId: user._id
    });

    if (!healthCheck) {
      return res.status(404).json({
        success: false,
        message: 'Health check not found'
      });
    }

    // Generate a unique hash for the shareable report
    const reportHash = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create shareable report data
    const shareableReport = {
      id: reportHash,
      healthCheckId: healthCheck._id,
      userId: user._id,
      companyName: user.startupName,
      companySlug: user.startupName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      viewCount: 0,
      healthCheckData: {
        assessmentDate: healthCheck.assessmentDate,
        score: healthCheck.score,
        riskLevel: healthCheck.riskLevel,
        answers: Object.fromEntries(healthCheck.answers || new Map()),
        followUpAnswers: Object.fromEntries(healthCheck.followUpAnswers || new Map()),
        recommendations: healthCheck.recommendations || [],
        strengths: healthCheck.strengths || [],
        redFlags: healthCheck.redFlags || [],
        risks: healthCheck.risks || []
      }
    };

    // Store the shareable report
    shareableReports.set(reportHash, shareableReport);

    // Generate the shareable URL using frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareableUrl = `${frontendUrl}/shared-report/${shareableReport.companySlug}/${reportHash}`;

    res.status(201).json({
      success: true,
      message: 'Shareable report created successfully',
      data: {
        shareableUrl,
        reportHash,
        expiresAt,
        companySlug: shareableReport.companySlug
      }
    });

  } catch (error) {
    console.error('Create shareable report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shareable report',
      error: error.message
    });
  }
});

// GET /api/shareable-reports/:companySlug/:hash - Get shareable report data
router.get('/:companySlug/:hash', async (req, res) => {
  try {
    const { hash, companySlug } = req.params;

    // Get the shareable report
    const shareableReport = shareableReports.get(hash);

    if (!shareableReport) {
      return res.status(404).json({
        success: false,
        message: 'Shareable report not found'
      });
    }

    // Check if report has expired
    if (new Date() > shareableReport.expiresAt || !shareableReport.isActive) {
      return res.status(410).json({
        success: false,
        message: 'This report has expired or is no longer available'
      });
    }

    // Verify company slug matches
    if (shareableReport.companySlug !== companySlug) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Increment view count
    shareableReport.viewCount += 1;

    // Get user info for company details
    const user = await User.findById(shareableReport.userId).select('startupName founderName city state country website');

    res.status(200).json({
      success: true,
      data: {
        companyName: shareableReport.companyName,
        companyDetails: user ? {
          startupName: user.startupName,
          founderName: user.founderName,
          location: `${user.city}, ${user.state}, ${user.country}`,
          website: user.website
        } : null,
        healthCheck: shareableReport.healthCheckData,
        reportInfo: {
          createdAt: shareableReport.createdAt,
          expiresAt: shareableReport.expiresAt,
          viewCount: shareableReport.viewCount
        }
      }
    });

  } catch (error) {
    console.error('Get shareable report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shareable report',
      error: error.message
    });
  }
});

// GET /api/shareable-reports/user/list - Get user's shareable reports
router.get('/user/list', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const user = req.user;

    // Filter shareable reports for this user
    const userReports = Array.from(shareableReports.values())
      .filter(report => report.userId.toString() === user._id.toString())
      .map(report => ({
        id: report.id,
        companySlug: report.companySlug,
        createdAt: report.createdAt,
        expiresAt: report.expiresAt,
        isActive: report.isActive && new Date() <= report.expiresAt,
        viewCount: report.viewCount,
        score: report.healthCheckData.score,
        assessmentDate: report.healthCheckData.assessmentDate,
        shareableUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-report/${report.companySlug}/${report.id}`
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: {
        reports: userReports
      }
    });

  } catch (error) {
    console.error('Get user shareable reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shareable reports',
      error: error.message
    });
  }
});

// DELETE /api/shareable-reports/:hash - Deactivate a shareable report
router.delete('/:hash', verifyFirebaseToken, requireOnboarding, async (req, res) => {
  try {
    const { hash } = req.params;
    const user = req.user;

    const shareableReport = shareableReports.get(hash);

    if (!shareableReport) {
      return res.status(404).json({
        success: false,
        message: 'Shareable report not found'
      });
    }

    // Verify ownership
    if (shareableReport.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to deactivate this report'
      });
    }

    // Deactivate the report
    shareableReport.isActive = false;

    res.status(200).json({
      success: true,
      message: 'Shareable report deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate shareable report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate shareable report',
      error: error.message
    });
  }
});

module.exports = router;