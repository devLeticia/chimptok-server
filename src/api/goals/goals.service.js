const { db } = require('../../utils/db');
const { getCycleByGoalId } = require('../cycles/cycles.service');

async function AddGoal(
  goalId,
  userId,
  goalName,
  deadline,
  weeklyHours,
  tasks,
) {
  try {
    const createdGoal = await db.goal.create({
      data: {
        id: goalId,
        goalName,
        deadline,
        weeklyHours,
        user: {
          connect: {
            id: userId,
          },
        },
        tasks: {
          create: tasks.map((task) => ({
            taskName: task.taskName,
            isCompleted: false,
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    return createdGoal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
}
async function findGoalById (goalId) {
  try {
    return goal = await db.goal.findUnique({ where: { id: goalId } });
    
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}
async function updateGoal(goalId, goalName, deadline, weeklyHours, tasks, userId) {
  try {
    const updatedGoal = await db.goal.update({
      where: { id: goalId },
      data: {
        goalName,
        deadline,
        weeklyHours,
        tasks: {
          deleteMany: {},
          create: tasks.map((task) => ({
            taskName: task.taskName,
            isCompleted: false,
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    return updatedGoal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}

async function deleteGoal(goalId) {
  try {
    await db.goal.delete({
      where: {
        id: goalId,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getAllGoals(userId) {
  try {
    const goals = await db.goal.findMany({
      where: {
        userId,
      },
      include: {
        tasks: true,
      },
    });

    const mappedGoals = goals.map((goal) => ({
      id: goal.id,
      goalName: goal.goalName,
      tasks: goal.tasks,
      createdAt: goal.createdAt,
      deadline: goal.deadline,
      hoursPerWeek: goal.weeklyHours,
      overallProgress: {
        overallExpectedHours: 0,
        overallAccomplisedHours: 0,
        overallCycles: 0
      },
      dayProgress: {
        dayExpectedHours: 0,
        dayAccomplisedHours: 0,
        dayCycles: 0
      },
      isCompleted: goal.isCompleted,
    }));

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
    });
 
    mappedGoals.forEach(goal => {
       const goalCycles = cycles.filter(cycle => cycle.task.goalId === goal.id && cycle.interruptedAt === null);
       const sumOfCyclesInMinutes = goalCycles.reduce((total, cycle) => total + cycle.minutesAmount, 0);
       const overallAccomplisedHours =  sumOfCyclesInMinutes / 60
        goal.overallProgress.overallExpectedHours = goal.hoursPerWeek
        goal.overallProgress.overallAccomplisedHours = overallAccomplisedHours 

        const today = new Date()
        const totalCyclesOfTheDay =  cycles.filter(cycle => cycle.task.goalId === goal.id && cycle.interruptedAt === null &&
          today.getFullYear() === cycle.createdAt.getFullYear() &&
          today.getMonth() === cycle.createdAt.getMonth() &&
          today.getDate() === cycle.createdAt.getDate()
          );
        const sumOfCyclesOfTheDayInMinutes = totalCyclesOfTheDay.reduce((total, cycle) => total + cycle.minutesAmount, 0);
        goal.dayProgress.dayExpectedHours = goal.hoursPerWeek / 7
        goal.dayProgress.dayAccomplisedHours = sumOfCyclesOfTheDayInMinutes / 60
      });

    
    return mappedGoals;
  } catch (err) {
    console.error('Error retrieving goals:', err);
    throw err; 
  }
}

async function getTodaysGoal(userId) {
  try {
    const goals = await db.goal.findMany({
      where: {
        userId,
        isCompleted: false,
      },
      include: {
        tasks: true,
      },
    });
    const totalHoursPerWeek = goals.reduce((total, goal) => total + goal.weeklyHours, 0);
    const goalOfTheDay = {
      totalHoursPerWeek,
      goalOfTheDayInHours: totalHoursPerWeek / 7,
      minutesAccomplishedToday: 0,
    };

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
    });

    todaysCycle = cycles.filter((cycle) => {
        const today = new Date();
        return today.getFullYear() === cycle.createdAt.getFullYear() &&
               today.getMonth() === cycle.createdAt.getMonth() &&
               today.getDate() === cycle.createdAt.getDate()
               && cycle.interruptedAt === null
      });

      const minutesInDay = todaysCycle.reduce((total, cycle) => total + cycle.minutesAmount, 0);
      const hoursInDay = minutesInDay / 60
      goalOfTheDay.minutesAccomplishedToday = hoursInDay
    
    return goalOfTheDay;
  } catch (err) {
    console.error('Error retrieving goals:', err);
    throw err;
  }
}

async function getGoalRanking(userId) {
  try {
    const userActiveGoals = await db.goal.findMany({
      where: {
        userId,
        isCompleted: false,
      },
      include: {
        tasks: true,
      },
    });

    const goalRaking = await Promise.all(
      userActiveGoals.map(async (goal) => {
        const goalStartDate = new Date(goal.createdAt);
        const goalFinishDate = new Date(goal.deadline);
        const expectedDays = (goalFinishDate - goalStartDate) / (1000 * 60 * 60 * 24);
        const dayExpectedHours = goal.weeklyHours / 7;
        let totalExpectedHours = expectedDays * dayExpectedHours;

        const goalRelatedCycles = await getCycleByGoalId(goal.id);
        let totalHoursWorked = goalRelatedCycles
          .filter((cycle) => cycle.interruptedAt === null)
          .reduce((total, cycle) => total + cycle.minutesAmount, 0) / 60;

        let progressPercentage =
          totalExpectedHours === 0 ? 0 : (totalHoursWorked / totalExpectedHours) * 100;
          

        progressPercentage = Number(progressPercentage.toFixed(2));
        totalExpectedHours = Number(totalExpectedHours.toFixed(2));
        totalHoursWorked = Number(totalHoursWorked.toFixed(2));

       
        return {
          name: goal.goalName,
          totalExpectedHours,
          totalHoursWorked,
          progressPercentage,
          deadline: goal.deadline,
        };
      })
    );

    goalRaking.sort((a, b) => b.progressPercentage - a.progressPercentage);
    return goalRaking;
  } catch (error) {
    console.error('Error retrieving ranking:', error);
    throw error;
  }
}

async function setIsCompleted(id, completed) {
  console.log('entrou')
  try {
    const updatedGoal = await db.goal.update({
      where: { id: id },
      data: { isCompleted: completed },
    });
    return updatedGoal;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  AddGoal,
  deleteGoal,
  getAllGoals,
  getTodaysGoal,
  getGoalRanking,
  updateGoal,
  findGoalById,
  setIsCompleted
};
