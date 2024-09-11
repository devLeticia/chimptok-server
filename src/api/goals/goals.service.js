const { db } = require('../../utils/db');

async function AddGoal(
  goalId,
  userId,
  goalName,
  deadline,
  weeklyHours,
  tasks,
) {
  try {
    // Create the goal in the database
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
        tasks: true, // Include associated tasks in the response
      },
    });

    return createdGoal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
}

async function deleteGoal(goalId) {
  try {
    // Delete the goal from the database
    await db.goal.delete({
      where: {
        id: goalId,
      },
    });

    // Return success response
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getAllGoals(userId) {
  try {
    // Retrieve goals from the database
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
        inHours: 0,
        inPercentage: 0
      },
      dayProgress: {
        inHours: 0,
        inPercentage: 0
      },
      status: 1,
    }));

    return mappedGoals;
  } catch (err) {
    console.error('Error retrieving goals:', err);
    throw err; // Re-throwing the error to be handled by the caller
  }
}

async function getTodaysGoal(userId) {
  try {
    const goals = await db.goal.findMany({
      where: {
        userId,
        isFinished: false,
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

    return goalOfTheDay;
  } catch (err) {
    console.error('Error retrieving goals:', err);
    throw err; // Re-throwing the error to be handled by the caller
  }
}
module.exports = {
  AddGoal,
  deleteGoal,
  getAllGoals,
  getTodaysGoal,
};
