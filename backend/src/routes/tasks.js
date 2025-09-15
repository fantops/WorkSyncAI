const express = require('express');
const { body, validationResult } = require('express-validator');
const { Task, User } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      priority,
      limit = 50,
      offset = 0,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    const whereClause = { userId: req.user.id };

    // Add filters
    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      data: {
        tasks: tasks.rows,
        pagination: {
          total: tasks.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < tasks.count
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['todo', 'in_progress', 'done', 'blocked']),
  body('complexity').optional().isIn(['simple', 'medium', 'complex'])
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

    const taskData = {
      ...req.body,
      userId: req.user.id
    };

    // Calculate AI priority score (simple rule-based for MVP)
    taskData.aiPriorityScore = calculateAIPriorityScore(taskData);

    const task = await Task.create(taskData);

    // Fetch the created task with user details
    const createdTask = await Task.findByPk(task.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      data: {
        task: createdTask
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get a specific task
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['todo', 'in_progress', 'done', 'blocked']),
  body('complexity').optional().isIn(['simple', 'medium', 'complex'])
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

    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    const updateData = { ...req.body };

    // Recalculate AI priority score if relevant fields changed
    if (updateData.priority || updateData.dueDate || updateData.complexity) {
      updateData.aiPriorityScore = calculateAIPriorityScore({ ...task.dataValues, ...updateData });
    }

    await task.update(updateData);

    const updatedTask = await Task.findByPk(task.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    await task.destroy();

    res.json({
      success: true,
      data: {
        message: 'Task deleted successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/tasks/:id/start
 * @desc    Start a task (change status to in_progress)
 * @access  Private
 */
router.post('/:id/start', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    await task.update({
      status: 'in_progress',
      startedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        task,
        message: 'Task started successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/tasks/:id/complete
 * @desc    Complete a task (change status to done)
 * @access  Private
 */
router.post('/:id/complete', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    const updateData = {
      status: 'done',
      completedAt: new Date()
    };

    // Add actual hours if provided
    if (req.body.actualHours) {
      updateData.actualHours = req.body.actualHours;
    }

    await task.update(updateData);

    res.json({
      success: true,
      data: {
        task,
        message: 'Task completed successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate AI priority score (rule-based for MVP)
function calculateAIPriorityScore(taskData) {
  let score = 0.5; // Base score

  // Priority weight
  const priorityWeights = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
  score += (priorityWeights[taskData.priority] || 0.5) * 0.3;

  // Due date urgency
  if (taskData.dueDate) {
    const daysUntilDue = Math.ceil((new Date(taskData.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 1) score += 0.3;
    else if (daysUntilDue <= 3) score += 0.2;
    else if (daysUntilDue <= 7) score += 0.1;
  }

  // Complexity factor (simpler tasks get slight priority boost for quick wins)
  const complexityWeights = { simple: 0.1, medium: 0, complex: -0.1 };
  score += complexityWeights[taskData.complexity] || 0;

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}

module.exports = router;