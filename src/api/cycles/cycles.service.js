const { db } = require('../../utils/db');

async function AddCycle(
  id,
  userId,
  taskId,
  minutesAmount,
) {
  try {
    // Create the cycle in the database
    const createdCycle = await db.cycle.create({
      data: {
        id,
        userId,
        taskId,
        minutesAmount,
        task: {
          connect: {
            id: taskId,
          },
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
          lt: now,
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
        goals: true,
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
