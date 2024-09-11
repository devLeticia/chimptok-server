const { db } = require('../../utils/db');

async function AddCycle(
  userId,
  taskId,
  minutesAmount,
) {
  try {
    console.log('--->', minutesAmount);
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

async function getAllCycles(userId) {
  try {
    const cycles = await db.cycle.findMany({
      where: {
        userId,
      },
      include: {
        task: {
          include: {
            goal: true, // Include the goal relation within the task relation
          },
        },
      },
    });

    return cycles;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw error;
  }
}
module.exports = {
  AddCycle,
  getActiveCycle,
  getAllCycles,
};
