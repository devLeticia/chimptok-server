const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { findUserById } = require('../users/users.services');

const router = express.Router();

const { registerGoalSchema } = require('../../validators/goal.validator');
const { AddGoal, deleteGoal, getAllGoals, updateGoal, findGoalById, setIsCompleted } = require('./goals.service');

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


router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await getAllGoals(userId);
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

router.put('/:goalId', async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { userId, goalName, deadline, weeklyHours, tasks } = registerGoalSchema.parse(req.body);


    const existingUser = await findUserById(userId);
    if (!existingUser) return res.status(404).send({ message: 'User Not Found.' });


    const existingGoal = await findGoalById(goalId)
    if (!existingGoal) return res.status(404).send({ message: 'Goal Not Found.' });


    const updatedGoal = await updateGoal(goalId, goalName, deadline, weeklyHours, tasks, userId);

    if (updatedGoal) return res.status(200).json({ message: 'Updated successfully', updatedGoal });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/completed', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body; // Expecting { "completed": true/false } in the request body

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid value for completed. Must be true or false.' });
  }

  try {
    const response = await setIsCompleted(id, completed);
    res.status(200).json({
      message: `Goal marked as ${completed ? 'completed' : 'not completed'} successfully`,
      goal: response,
    });
  } catch (error) {
    console.error('Error setting goal flag isCompleted:', error);
    res.status(500).json({ error: 'Failed to set flag' });
  }
});


router.delete('/:goalId', async (req, res) => {
  const { goalId } = req.params;
  try {
    const response = deleteGoal(goalId);
    if (response) res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
