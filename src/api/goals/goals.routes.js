const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { findUserById } = require('../users/users.services');

const router = express.Router();

const { registerGoalSchema } = require('../../validators/goal.validator');
const { AddGoal, deleteGoal, getAllGoals } = require('./goals.service');

router.post('/', async (req, res, next) => {
  try {
    const {
      userId,
      goalName,
      deadline,
      weeklyHours,
      tasks,
    } = registerGoalSchema.parse(req.body);

    const existingUser = await findUserById(userId);
    if (!existingUser) return res.status(404).send({ message: 'User Not found.' });

    const goalId = uuidv4();
    const response = await AddGoal(
      goalId,
      userId,
      goalName,
      deadline,
      weeklyHours,
      tasks,
    );
    if (response) return res.status(200).json({ message: 'Salvo com sucesso' });
  } catch (error) {
    next(error);
  }
  return null;
});

// retrie active goals

// retrieve all user's goals
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await getAllGoals(userId); // Wait for the asynchronous function to complete
    if (response) {
      res.status(200).json({ message: 'Goals retrieved', data: response });
    } else {
      res.status(404).json({ message: 'No goals found for the user' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error retrieving goals:', error);
    res.status(500).json({ error: 'Failed to retrieve goals' });
  }
});

// delete a goal
router.delete('/:goalId', async (req, res) => {
  const { goalId } = req.params;
  try {
    const response = deleteGoal(goalId);
    if (response) res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
