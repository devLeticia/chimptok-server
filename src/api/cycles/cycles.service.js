const { db } = require('../../utils/db');

async function AddCycle(
  userId,
  taskId,
  minutesAmount,
) {
  try {
    // Create the cycle in the database
    const currentDate = new Date();
    // Convert minutes to milliseconds
    const finishAt = new Date(currentDate.getTime() + minutesAmount * 60000);
    const createdCycle = await db.cycle.create({
      data: {
        minutesAmount,
        interruptedAt: null,
        finishAt,
        task: {
          connect: {
            id: taskId,
          },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    return createdCycle;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
}

// return the cycle that has not finished yet
async function getActiveCycle(userId) {
  try {
    const now = new Date();
    const activeCycle = await db.cycle.findFirst({
      where: {
        userId,
        finishAt: {
          gte: now,
        },
      },
      include: {
        task: {
          include: {
            goal: true, // Include the goal relation within the task relation
          },
        },
      },
    });

    return activeCycle;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw error;
  }
}

async function getCycleByGoalId(goalId) {
  const cycles = await db.cycle.findMany({
    where: {
      task: {
        goalId: goalId,
      }
    },
    include: {
      task: {
        include: {
          goal: true,
        },
      },
    },
  });

  return cycles
}

async function getAllCycles(userId) {
  try {
    const cycles = await db.cycle.findMany({
      where: {
        userId,
      },
      include: {
        task: {
          include: {
            goal: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cycles;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw error;
  }
}

async function getUserStats (userId) {
  const userCycles = await getAllCycles(userId)
  const userStats = {
    totalHoursInTasks: 0,
    totalCycles: 0,
    bestStreak: 0
  }
  
  const completedCycles = userCycles.filter(goal => goal.interruptedAt === null);
  const totalMinutesCompleted = completedCycles.reduce((total, cycle) => total + cycle.minutesAmount, 0);
  const totalHoursCompleted = totalMinutesCompleted / 60
  userStats.totalHoursInTasks = totalHoursCompleted
  userStats.totalCycles = completedCycles.length +  1
  userStats.bestStreak = getUserBestStreak(userCycles)

  return userStats
  }

 function getUserBestStreak(cycles) {
  if (!cycles || cycles.length === 0) return 0;

  // Step 1: Extract the dates and sort them in ascending order
  const dates = cycles
    .map(cycle => new Date(cycle.createdAt).toISOString().split('T')[0]) // Extract only the date part (YYYY-MM-DD)
    .sort((a, b) => new Date(a) - new Date(b)); // Sort in ascending order

  let currentStreak = 1; // Start with at least 1 day streak
  let bestStreak = 1;

  // Step 2: Loop through the sorted dates to find the best streak
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const previousDate = new Date(dates[i - 1]);

    // Calculate the difference in days
    const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      // If the difference is exactly 1 day, continue the streak
      currentStreak++;
    } else if (dayDifference > 1) {
      // If a day was skipped, reset the current streak
      currentStreak = 1;
    }

    // Update the best streak if the current streak is longer
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    return bestStreak
  }
}

async function getLastTwoWeeksConsistency(userId) {
  const cycles = await getAllCycles(userId);

  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 13); 

  
  const last14Days = [];


  for (let i = 0; i < 14; i++) {
    const currentDay = new Date(fourteenDaysAgo);
    currentDay.setDate(fourteenDaysAgo.getDate() + i);


    const cyclesForDay = cycles.filter(cycle => {
      const cycleDate = new Date(cycle.createdAt);
      return cycleDate.toDateString() === currentDay.toDateString(); 
    });

    
    const totalHoursWorkedInTheDay = cyclesForDay.reduce((total, cycle) => total + cycle.minutesAmount / 60, 0);
    const totalCyclesInTheDay = cyclesForDay.length;

   
    last14Days.push({
      date: currentDay,
      totalHoursWorkedInTheDay,
      totalCyclesInTheDay,
    });
  }

  console.log('LAST 14 DAYS!!', last14Days);
  return last14Days; // Dates will be returned as Date objects
}


module.exports = {
  AddCycle,
  getActiveCycle,
  getAllCycles,
  getUserStats,
  getLastTwoWeeksConsistency,
  getCycleByGoalId
};
