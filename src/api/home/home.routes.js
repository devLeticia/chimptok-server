// const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { getAllGoals, getTodaysGoal } = require('../goals/goals.service');
const { getActiveCycle } = require('../cycles/cycles.service');
const { getConsistencyOfTheWeek } = require('./home.service');

const router = express.Router();

// endpoints that will retrieve data in the home
// datas needed:
// 1. Active Goals and Tasks
// 2. Active Cycle - if any
// 3. today's goal (goals and acomplished)
// 4. Consiistency of the week

router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  try {
    if (userId) {
      const activeGoals = await getAllGoals(userId);
      const activeCycle = await getActiveCycle(userId);
      const progressOfTheDay = await getTodaysGoal(userId);
      const consistencyOfTheWeek = await getConsistencyOfTheWeek(userId);

      const homeData = {
        userGoals: activeGoals, // working \o/
        activeCycle, // working \o/ - BUT, when I interrupt the task, it still is retrieving as active goal.
        progressOfTheDay, 
        consistencyOfTheWeek,
      };
      res.status(200).json({ message: 'Goals retrieved', data: homeData });
    }
    return res.data = 'userId was not found';
  } catch (error) {
    next(error);
  }
  return null;
});

module.exports = router;
