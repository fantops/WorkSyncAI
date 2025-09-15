const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const adoService = require('../services/ADOService');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware to initialize ADO service with PAT
const initializeADOWithPAT = (req, res, next) => {
  try {
    const pat = process.env.ADO_PERSONAL_ACCESS_TOKEN;
    const organization = process.env.ADO_DEFAULT_ORGANIZATION;
    
    if (!pat || pat === 'your-pat-token-here') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'PAT_NOT_CONFIGURED',
          message: 'Personal Access Token not configured. Please set ADO_PERSONAL_ACCESS_TOKEN in environment.'
        }
      });
    }
    
    if (!organization) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'ORGANIZATION_NOT_CONFIGURED',
          message: 'ADO organization not configured. Please set ADO_DEFAULT_ORGANIZATION in environment.'
        }
      });
    }
    
    // Initialize ADO service with PAT
    adoService.initializeWithPAT(organization, pat);
    next();
  } catch (error) {
    logger.error('Error initializing ADO service:', error);
    next(error);
  }
};

/**
 * @route   POST /api/v1/ado/initialize
 * @desc    Initialize ADO service with user's organization and token
 * @access  Private
 */
router.post('/initialize', [
  body('organization').notEmpty().withMessage('ADO organization is required'),
  body('accessToken').notEmpty().withMessage('Access token is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { organization, accessToken } = req.body;
    
    // Initialize ADO service
    adoService.initialize(organization, accessToken);
    
    // Test the connection
    const connectionTest = await adoService.testConnection();
    
    if (!connectionTest.success) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ADO_CONNECTION_FAILED',
          message: connectionTest.message
        }
      });
    }

    // Store ADO credentials in session/user context (for demo)
    // In production, this would be encrypted and stored securely
    req.user.adoOrganization = organization;
    req.user.adoAccessToken = accessToken; // Should be encrypted

    res.json({
      success: true,
      data: {
        message: 'ADO service initialized successfully',
        organization: organization,
        userInfo: connectionTest.userInfo
      }
    });

  } catch (error) {
    logger.error('ADO initialization error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/ado/projects
 * @desc    Get user's accessible ADO projects
 * @access  Public (uses PAT)
 */
router.get('/projects', initializeADOWithPAT, async (req, res, next) => {
  try {
    const projects = await adoService.getProjects();

    res.json({
      success: true,
      data: projects,
      totalCount: projects.length
    });

  } catch (error) {
    logger.error('Error fetching ADO projects:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/ado/backlog/:projectId
 * @desc    Get backlog items from specific project
 * @access  Public (uses PAT)
 */
router.get('/backlog/:projectId', initializeADOWithPAT, [
  param('projectId').notEmpty().withMessage('Project ID is required'),
  query('assignedToTeam').optional().isBoolean().withMessage('assignedToTeam must be boolean'),
  query('states').optional().isString().withMessage('states must be comma-separated string'),
  query('types').optional().isString().withMessage('types must be comma-separated string'),
  query('top').optional().isInt({ min: 1, max: 50 }).withMessage('top must be between 1 and 50')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { projectId } = req.params;
    const { assignedToTeam, states, types } = req.query;

    // Parse query parameters
    const options = {};
    if (assignedToTeam) options.assignedToTeam = assignedToTeam === 'true';
    if (states) options.states = states.split(',');
    if (types) options.backlogTypes = types.split(',');

    // Check if ADO service is initialized (done by middleware)
    if (!adoService.isAuthenticated()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADO_NOT_INITIALIZED',
          message: 'ADO service not initialized. PAT configuration error.'
        }
      });
    }

    const backlogItems = await adoService.getBacklogItems(projectId, options);

    res.json({
      success: true,
      data: {
        backlogItems: backlogItems,
        totalCount: backlogItems.length,
        projectId: projectId,
        filters: options
      }
    });

  } catch (error) {
    logger.error('Error fetching backlog items:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/ado/workitem/:workItemId  
 * @desc    Get specific work item by ID
 * @access  Private
 */
router.get('/workitem/:workItemId', initializeADOWithPAT, [
  param('workItemId').isInt().withMessage('Work item ID must be a valid integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { workItemId } = req.params;

    // Check if ADO service is initialized (done by middleware)
    if (!adoService.isAuthenticated()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADO_NOT_INITIALIZED',
          message: 'ADO service not initialized. PAT configuration error.'
        }
      });
    }

    const workItem = await adoService.getWorkItem(parseInt(workItemId));

    res.json({
      success: true,
      data: {
        workItem: workItem
      }
    });

  } catch (error) {
    logger.error(`Error fetching work item ${req.params.workItemId}:`, error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/ado/test-connection
 * @desc    Test ADO connection
 * @access  Public (uses PAT)
 */
router.get('/test-connection', initializeADOWithPAT, async (req, res, next) => {
  try {
    // Check if ADO service is initialized (done by middleware)
    if (!adoService.isAuthenticated()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADO_NOT_INITIALIZED',
          message: 'ADO service not initialized. PAT configuration error.'
        }
      });
    }

    const testResult = await adoService.testConnection();

    res.json({
      success: testResult.success,
      data: testResult
    });

  } catch (error) {
    logger.error('ADO connection test error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/ado/activity/:projectId
 * @desc    Get recent activity for a project
 * @access  Private
 */
router.get('/activity/:projectId', initializeADOWithPAT, [
  param('projectId').notEmpty().withMessage('Project ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { projectId } = req.params;

    // Check if ADO service is initialized (done by middleware)
    if (!adoService.isAuthenticated()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADO_NOT_INITIALIZED',
          message: 'ADO service not initialized. PAT configuration error.'
        }
      });
    }

    const activity = await adoService.getRecentActivity(projectId);

    res.json({
      success: true,
      data: {
        activity: activity,
        totalCount: activity.length,
        projectId: projectId
      }
    });

  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    next(error);
  }
});

module.exports = router;