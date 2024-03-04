// const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { getAllGoals } = require('../goals/goals.service');
const { getActiveCycle } = require('../cycles/cycles.service');

const router = express.Router();

// endpoints that will retrieve data in the home
// datas needed:
// 1. Active Goals and Tasks
// 2. Active Cycle - if any
// 3. today's goal (goals and acomplished)
// 4. Consiistency of the week

router.get('/:userdId', async (req, res, next) => {
  const { userId } = req.params;
  try {
    const activeGoals = await getAllGoals(userId);
    const activeCycle = await getActiveCycle(userId);
    const todaysGoal = await getTodaysGoal(userId);
    console.log(activeGoas);
    const homeData = {
      activeGoals,
      activeCycle,
      todaysGoal: {},
      weeekConsistency: [],
    };
    res.data = homeData;
  } catch (error) {
    next(error);
  }
  return null;
});
