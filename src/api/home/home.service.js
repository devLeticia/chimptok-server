const { db } = require('../../utils/db');
const { getAllGoals } = require('../goals/goals.service');

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

  
    const today = new Date();
    const monday = getMondayOfCurrentWeek(new Date(today));
    const weekArray = [];

   
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i); 

      const dayObject = {
        day: i + 1,
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
        date: new Date(day.getFullYear(), day.getMonth(), day.getDate()),
        goalOfTheDayInHours: 0,
        WorkedHoursInTheDay: 0,
      };
      
      dayObject.goalOfTheDayInHours = await getGoalsOfTheDayInHours(dayObject.date);
      dayObject.WorkedHoursInTheDay = await getWorkedHoursInTheDay(dayObject.date);

      weekArray.push(dayObject);
    }

    async function getGoalsOfTheDayInHours (date) {
      const allGoals = await getAllGoals(userId);
      const filteredGoalsByEndDate = allGoals.filter(goal => goal.deadline >= new Date(date));
      const sumHoursPerWeek = filteredGoalsByEndDate.reduce((total, goal) => total + goal.hoursPerWeek, 0);
      const goalOfTheDayInHours = sumHoursPerWeek / 7
      return goalOfTheDayInHours
    }

    async function getWorkedHoursInTheDay(date) {
      const cyclesOfTheDay = cycles.filter((cycle) => {
        const cycleDate = new Date(cycle.createdAt);
        return cycleDate.getFullYear() === date.getFullYear() &&
               cycleDate.getMonth() === date.getMonth() &&
               cycleDate.getDate() === date.getDate();
      });
      const sumMinutes = cyclesOfTheDay.reduce((total, cycle) => total + cycle.minutesAmount, 0);
      const minutesInHours = sumMinutes / 60
      return minutesInHours;
    }

    const cyclesWithinWeek = cycles.filter((cycle) => {
      const cycleDate = new Date(cycle.createdAt);
      return cycleDate >= monday && cycleDate <= new Date(weekArray[6].date) && cycle.interruptedAt === null;
    });

    weekArray.forEach((day, index) => { 
      const cyclesInTheDay = cyclesWithinWeek.filter((cycle) => {
       
        const cycleDate = new Date(cycle.createdAt);
        const dayDate = new Date(day.date);

        return cycleDate.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0];
      });

      
      const totalHours = cyclesInTheDay.reduce((total, cycle) => total + cycle.minutesAmount, 0);

    });

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
