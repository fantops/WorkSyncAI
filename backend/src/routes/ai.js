const express = require('express');
const axios = require('axios');
const { Task, User } = require('../models');
const { Op } = require('sequelize');
const config = require('../config/config-mvp');

const router = express.Router();

/**
 * @route   GET /api/v1/ai/recommendations
 * @desc    Get AI-powered task recommendations
 * @access  Private
 */
router.get('/recommendations', async (req, res, next) => {
  try {
    const { type = 'priority', limit = 5 } = req.query;

    const recommendations = await generateRecommendations(req.user.id, type, parseInt(limit));

    res.json({
      success: true,
      data: {
        recommendations,
        type,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/ai/analyze-task
 * @desc    Analyze a task and provide AI insights
 * @access  Private
 */
router.post('/analyze-task', async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TITLE',
          message: 'Task title is required'
        }
      });
    }

    const analysis = await analyzeTaskContent(title, description);

    res.json({
      success: true,
      data: {
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/ai/insights
 * @desc    Get productivity insights for the user
 * @access  Private
 */
router.get('/insights', async (req, res, next) => {
  try {
    const insights = await generateProductivityInsights(req.user.id);

    res.json({
      success: true,
      data: {
        insights
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions for AI logic (rule-based for MVP)

async function generateRecommendations(userId, type, limit) {
  const tasks = await Task.findAll({
    where: {
      userId,
      status: { [Op.in]: ['todo', 'in_progress'] }
    },
    order: [['aiPriorityScore', 'DESC']],
    limit: limit * 2 // Get more tasks to filter from
  });

  const recommendations = [];

  switch (type) {
    case 'priority':
      recommendations.push(...generatePriorityRecommendations(tasks, limit));
      break;
    case 'quick_wins':
      recommendations.push(...generateQuickWinRecommendations(tasks, limit));
      break;
    case 'overdue':
      recommendations.push(...generateOverdueRecommendations(tasks, limit));
      break;
    default:
      recommendations.push(...generatePriorityRecommendations(tasks, limit));
  }

  return recommendations.slice(0, limit);
}

function generatePriorityRecommendations(tasks, limit) {
  return tasks
    .sort((a, b) => (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0))
    .slice(0, limit)
    .map(task => ({
      id: `rec_${task.id}`,
      type: 'priority',
      task_id: task.id,
      task: task,
      confidence_score: task.aiPriorityScore || 0.5,
      reasoning: generateReasoning(task),
      action: 'Work on this task next',
      metadata: {
        factors: getTaskFactors(task),
        estimated_impact: getEstimatedImpact(task)
      }
    }));
}

function generateQuickWinRecommendations(tasks, limit) {
  return tasks
    .filter(task => task.complexity === 'simple' || task.estimatedHours <= 2)
    .sort((a, b) => (a.estimatedHours || 4) - (b.estimatedHours || 4))
    .slice(0, limit)
    .map(task => ({
      id: `rec_${task.id}`,
      type: 'quick_win',
      task_id: task.id,
      task: task,
      confidence_score: 0.8,
      reasoning: `Quick win opportunity - estimated ${task.estimatedHours || 'low'} hours`,
      action: 'Complete this for a quick productivity boost',
      metadata: {
        factors: ['low_complexity', 'short_duration'],
        estimated_impact: 'momentum_boost'
      }
    }));
}

function generateOverdueRecommendations(tasks, limit) {
  const overdueTasks = tasks
    .filter(task => task.dueDate && new Date() > new Date(task.dueDate))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, limit);

  return overdueTasks.map(task => ({
    id: `rec_${task.id}`,
    type: 'overdue',
    task_id: task.id,
    task: task,
    confidence_score: 0.95,
    reasoning: `This task is overdue by ${Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))} days`,
    action: 'Address this overdue task immediately',
    metadata: {
      factors: ['overdue', 'deadline_pressure'],
      estimated_impact: 'risk_mitigation'
    }
  }));
}

function generateReasoning(task) {
  const reasons = [];

  if (task.priority === 'critical' || task.priority === 'high') {
    reasons.push(`High priority (${task.priority})`);
  }

  if (task.dueDate) {
    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 1) reasons.push('Due very soon');
    else if (daysUntilDue <= 3) reasons.push('Due within 3 days');
  }

  if (task.complexity === 'simple') {
    reasons.push('Low complexity - quick win opportunity');
  }

  if (reasons.length === 0) {
    reasons.push('Good candidate based on current workload');
  }

  return reasons.join(', ');
}

function getTaskFactors(task) {
  const factors = [];

  if (task.priority === 'high' || task.priority === 'critical') factors.push('high_priority');
  if (task.dueDate && Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 3) factors.push('urgent_deadline');
  if (task.complexity === 'simple') factors.push('low_complexity');
  if (task.estimatedHours && task.estimatedHours <= 2) factors.push('quick_task');

  return factors;
}

function getEstimatedImpact(task) {
  if (task.priority === 'critical') return 'high';
  if (task.priority === 'high') return 'medium';
  if (task.complexity === 'simple') return 'quick_boost';
  return 'standard';
}

async function analyzeTaskContent(title, description) {
  // Simple rule-based analysis for MVP
  const analysis = {
    complexity_score: 0.5,
    estimated_hours: 4,
    suggested_priority: 'medium',
    tags: extractTags(title, description),
    execution_guidance: generateExecutionGuidance(title, description)
  };

  // Adjust complexity based on keywords
  const complexityKeywords = {
    simple: ['fix', 'update', 'change', 'add', 'remove'],
    complex: ['implement', 'design', 'architect', 'integrate', 'refactor', 'migration']
  };

  const text = `${title} ${description}`.toLowerCase();

  if (complexityKeywords.complex.some(keyword => text.includes(keyword))) {
    analysis.complexity_score = 0.8;
    analysis.estimated_hours = 8;
    analysis.suggested_priority = 'high';
  } else if (complexityKeywords.simple.some(keyword => text.includes(keyword))) {
    analysis.complexity_score = 0.3;
    analysis.estimated_hours = 2;
  }

  return analysis;
}

function extractTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];

  const tagKeywords = {
    'bug': ['bug', 'fix', 'error', 'issue'],
    'feature': ['feature', 'implement', 'add', 'new'],
    'security': ['security', 'auth', 'authentication', 'encryption'],
    'database': ['database', 'db', 'sql', 'query'],
    'ui': ['ui', 'interface', 'frontend', 'design'],
    'api': ['api', 'endpoint', 'service', 'backend'],
    'testing': ['test', 'testing', 'qa', 'verification'],
    'deployment': ['deploy', 'deployment', 'release', 'production']
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['general'];
}

function generateExecutionGuidance(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('bug') || text.includes('fix')) {
    return [
      'Reproduce the issue',
      'Identify root cause',
      'Implement fix',
      'Test thoroughly',
      'Deploy to staging',
      'Verify resolution'
    ];
  }

  if (text.includes('implement') || text.includes('feature')) {
    return [
      'Define requirements clearly',
      'Design the solution',
      'Break into smaller tasks',
      'Implement incrementally',
      'Test each component',
      'Integrate and test end-to-end',
      'Deploy and monitor'
    ];
  }

  if (text.includes('database') || text.includes('sql')) {
    return [
      'Backup existing data',
      'Design schema changes',
      'Write migration scripts',
      'Test on staging environment',
      'Execute migration',
      'Verify data integrity'
    ];
  }

  // Default guidance
  return [
    'Break task into smaller steps',
    'Research best practices',
    'Plan implementation approach',
    'Execute step by step',
    'Test and validate',
    'Document changes'
  ];
}

async function generateProductivityInsights(userId) {
  const tasks = await Task.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 100
  });

  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');

  const insights = {
    summary: {
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      in_progress_tasks: inProgressTasks.length,
      completion_rate: tasks.length > 0 ? (completedTasks.length / tasks.length) : 0
    },
    recommendations: [
      {
        type: 'productivity',
        message: `You have ${inProgressTasks.length} tasks in progress. Consider focusing on completing them before starting new ones.`,
        priority: inProgressTasks.length > 3 ? 'high' : 'medium'
      },
      {
        type: 'planning',
        message: 'Try to estimate time for your tasks to improve planning accuracy.',
        priority: 'low'
      }
    ],
    patterns: analyzeUserPatterns(tasks)
  };

  return insights;
}

function analyzeUserPatterns(tasks) {
  const patterns = {
    most_common_priority: getMostCommonValue(tasks, 'priority'),
    most_common_complexity: getMostCommonValue(tasks, 'complexity'),
    average_completion_time: calculateAverageCompletionTime(tasks),
    productive_insights: []
  };

  // Add some insights based on patterns
  if (patterns.most_common_priority === 'low') {
    patterns.productive_insights.push('Consider prioritizing more high-impact tasks');
  }

  if (patterns.average_completion_time > 5) {
    patterns.productive_insights.push('Break down large tasks into smaller, manageable pieces');
  }

  return patterns;
}

function getMostCommonValue(tasks, field) {
  const counts = {};
  tasks.forEach(task => {
    const value = task[field];
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
}

function calculateAverageCompletionTime(tasks) {
  const completedTasks = tasks.filter(task => task.completedAt && task.startedAt);
  if (completedTasks.length === 0) return 0;

  const totalHours = completedTasks.reduce((sum, task) => {
    const hours = (new Date(task.completedAt) - new Date(task.startedAt)) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  return totalHours / completedTasks.length;
}

module.exports = router;