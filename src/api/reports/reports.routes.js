const express = require('express');
const { getUserStats, getLastTwoWeeksConsistency, getAllCycles} = require('../cycles/cycles.service');
const  { getGoalRanking }  = require('../goals/goals.service');
const router = express.Router();

router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  try {
    if (userId) {
      const userStats = await getUserStats(userId);
      const lastTwoWeeksConsistency = await getLastTwoWeeksConsistency(userId);
      const goalRanking = await getGoalRanking(userId);
      const cyclesHistory = await getAllCycles(userId);

      const reports = {
        userStats: userStats,
        lastTwoWeeksConsistency: lastTwoWeeksConsistency,
        cyclesHistory: cyclesHistory,
        goalRanking: goalRanking
      };
      res.status(200).json({ message: 'Report retrieved', data: reports });
    }
    return res.data = 'userId was not found';
  } catch (error) {
    next(error);
  }
  return null;
});

module.exports = router;
