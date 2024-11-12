const { db } = require('../../utils/db');

async function AddCycle(
  userId,
  taskId,
  minutesAmount,
) {
  try {
    const currentDate = new Date();
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


async function getActiveCycle(userId) {
  try {
    const now = new Date();
    const activeCycle = await db.cycle.findFirst({
      where: {
        userId,
        finishAt: {
          gte: now,
        },
        interruptedAt: null
      },
      include: {
        task: {
          include: {
            goal: true,
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
async function getCycleById(cycleId) {
  const cycles = await db.cycle.findMany({
    where: {
      id: cycleId
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


async function interruptCycle(cycleId) { 
  try {
    const updatedCycle = await db.cycle.update({
      where: {
        id: cycleId,
      },
      data: {
        interruptedAt: new Date(),
      },
      include: {
        task: {
          include: {
            goal: true,
          },
        },
      },
    });

    console.log('Cycle interrupted:', updatedCycle);
    return updatedCycle;

  } catch (error) {
    console.error('Error interrupting cycle:', error);
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
  userStats.totalCycles = completedCycles.length
  userStats.bestStreak = getUserBestStreak(userCycles)

  return userStats
  }

  function getUserBestStreak(cycles) {
    if (!cycles || cycles.length === 0) return 0;
  
    
    const dates = cycles
      .map(cycle => new Date(cycle.createdAt).toISOString().split('T')[0]) 
      .sort((a, b) => new Date(a) - new Date(b)); 
  
    let currentStreak = 1; 
    let bestStreak = 1; 
  

    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const previousDate = new Date(dates[i - 1]);
  
      const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
  
      if (dayDifference === 1) {
        currentStreak++;
      } else if (dayDifference > 1) {
        currentStreak = 1;
      }
  
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    }
  
    return bestStreak;
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

  return last14Days; 
}


module.exports = {
  AddCycle,
  getCycleById,
  getActiveCycle,
  getAllCycles,
  getUserStats,
  getLastTwoWeeksConsistency,
  getCycleByGoalId,
  interruptCycle
};
