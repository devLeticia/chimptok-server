const { db } = require('../../utils/db');

function getYear(date) {
  return date.getFullYear();
}

function getDayOfYear(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getWeekOfYear(dayOfYear) {
  return Math.floor(dayOfYear / 7) + 1;
}

const now = new Date();

// const weekConsistency = [
//   {
//     day: 1,
//     name: 'Mon',
//     date: '2024-01-22T00:00:00.000Z',
//     intensity: 0,
//     totalHoursInTasks: 2,
//     expectedHours: 4,
//   },
//   {
//     day: 2,
//     name: 'Tue',
//     date: '2024-01-22T00:00:00.000Z',
//     totalHoursInTasks: 2,
//     intensity: 1,
//     expectedHours: 4,
//   },
//   {
//     day: 3,
//     name: 'Wed',
//     date: '2024-01-23T00:00:00.000Z',
//     totalHoursInTasks: 2,
//     intensity: 3,
//     totalTaskCycles: 2,
//     totalGoals: 1,
//     expectedHours: 4,
//   },
//   {
//     day: 4,
//     name: 'Thu',
//     date: '2024-01-24T00:00:00.000Z',
//     totalHoursInTasks: 2,
//     totalTaskCycles: 2,
//     intensity: 2,
//     totalGoals: 1,
//     expectedHours: 4,
//   },
//   {
//     day: 5,
//     name: 'Fri',
//     date: '2024-01-26T00:00:00.000Z',
//     totalHoursInTasks: 2,
//     intensity: 2,
//     totalTaskCycles: 2,
//     totalGoals: 1,
//     expectedHours: 4,
//   },
//   {
//     day: 6,
//     name: 'Sat',
//     date: '2024-01-27T00:00:00.000Z',
//     intensity: 0,
//     totalHoursInTasks: 2,
//     totalTaskCycles: 2,
//     totalGoals: 1,
//     expectedHours: 4,
//   },
//   {
//     day: 7,
//     name: 'Sun',
//     date: '2024-01-28T00:00:00.000Z',
//     intensity: 2,
//     totalHoursInTasks: 2,
//     totalTaskCycles: 2,
//     totalGoals: 1,
//     expectedHours: 4,
//   },
// ];

function getMondayOfCurrentWeek(date) {
  const dayOfWeek = date.getDay(); // Get the day of the week (0-6, where 0 is Sunday)
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  // Calculate difference to Monday
  date.setDate(diff); // Set date to Monday of current week
  return date;
}
async function getConsistencyOfTheWeek(userId) {
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

    // Get today's date
    const today = new Date();

    // Get Monday of the current week
    const monday = getMondayOfCurrentWeek(new Date(today));

    // Initialize the array to hold the days of the week
    const weekArray = [];

    // Loop to create objects for each day of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i); // Add i days to Monday to get each day of the week

      const dayObject = {
        day: i + 1, // Day number (1 for Monday, 2 for Tuesday, etc.)
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
        date: new Date(day.getFullYear(), day.getMonth(), day.getDate()), // Corrected date creation
        intensity: 0,
        totalHoursInTasks: 0,
        expectedHours: 0, // Assuming default expected hours
      };

      weekArray.push(dayObject);
    }

    // Filter cycles array for cycles created within the current week
    const cyclesWithinWeek = cycles.filter((cycle) => {
      const cycleDate = new Date(cycle.createdAt);
      return cycleDate >= monday && cycleDate <= new Date(weekArray[6].date); // Sunday of the week
    });

    // agora que tenho os dias da semana e os ciclos realizados na semana:

    // pegar o total de horas em cada dia e adicionar no totalHoursintASK
    weekArray.forEach((day, index) => { // Loop through each day in weekArray
      const cyclesInTheDay = cyclesWithinWeek.filter((cycle) => {
        // Convert cycle.createdAt and day.date to Date objects
        const cycleDate = new Date(cycle.createdAt);
        const dayDate = new Date(day.date);

        return cycleDate.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0];
      });

      // Calculate total hours for the day based on cyclesInTheDay
      const totalHours = cyclesInTheDay.reduce((total, cycle) => total + cycle.minutesAmount, 0);

      // Update totalHoursInTasks for the day
      weekArray[index] = {
        ...weekArray[index], // Copy existing properties
        totalHoursInTasks: totalHours, // Update totalHoursInTasks
      };
    });

    // pegar todos os goals ativos e

    const consistencyOfTheWeek = {
      year: getYear(now),
      weekOfTheYear: getWeekOfYear(getDayOfYear(now)),
      dayOfTheYear: getDayOfYear(now),
      todayDate: now,
      weekConsistency: weekArray,
    };
    return consistencyOfTheWeek;
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw error;
  }
}

module.exports = {
  getConsistencyOfTheWeek,
};
