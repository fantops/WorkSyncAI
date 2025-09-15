const express = require('express');
const { User } = require('../models');

const router = express.Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { name, preferences } = req.body;

    const user = await User.findByPk(req.user.id);
    
    const updateData = {};
    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;

    await user.update(updateData);

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;