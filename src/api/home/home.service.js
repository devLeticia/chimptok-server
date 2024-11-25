const { db } = require('../../utils/db');
const { getAllGoals } = require('../goals/goals.service');

function getYear(date) {
  return date.getUTCFullYear();
}

function getDayOfYear(date) {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getWeekOfYear(dayOfYear) {
  return Math.floor(dayOfYear / 7) + 1;
}

const now = new Date();

function getMondayOfCurrentWeek(date) {
  const dayOfWeek = date.getUTCDay(); 
  const diff = date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  date.setUTCDate(diff);
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
            goal: true,
          },
        },
      },
    });

    const today = new Date();
    const monday = getMondayOfCurrentWeek(new Date(today));
    const weekArray = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + i);

      const dayObject = {
        day: i + 1,
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getUTCDay()],
        date: new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())),
        goalOfTheDayInHours: 0,
        WorkedHoursInTheDay: 0,
      };
      
      dayObject.goalOfTheDayInHours = await getGoalsOfTheDayInHours(dayObject.date);
      dayObject.WorkedHoursInTheDay = await getWorkedHoursInTheDay(dayObject.date);

      weekArray.push(dayObject);
    }

    async function getGoalsOfTheDayInHours(date) {
      const allGoals = await getAllGoals(userId);
      const filteredGoalsByEndDate = allGoals.filter(goal => goal.deadline >= new Date(date));
      const sumHoursPerWeek = filteredGoalsByEndDate.reduce((total, goal) => total + goal.hoursPerWeek, 0);
      return sumHoursPerWeek / 7;
    }

    async function getWorkedHoursInTheDay(date) {
      const cyclesOfTheDay = cycles.filter((cycle) => {
        const cycleDate = new Date(cycle.createdAt);
        return cycleDate.getUTCFullYear() === date.getUTCFullYear() &&
               cycleDate.getUTCMonth() === date.getUTCMonth() &&
               cycleDate.getUTCDate() === date.getUTCDate();
      });
      const sumMinutes = cyclesOfTheDay.reduce((total, cycle) => total + cycle.minutesAmount, 0);
      return sumMinutes / 60;
    }

    const cyclesWithinWeek = cycles.filter((cycle) => {
      const cycleDate = new Date(cycle.createdAt);
      return cycleDate >= new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate())) &&
             cycleDate <= new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6)) &&
             cycle.interruptedAt === null;
    });

    const consistencyOfTheWeek = {
      year: getYear(now),
      weekOfTheYear: getWeekOfYear(getDayOfYear(now)),
      dayOfTheYear: getDayOfYear(now),
      todayDate: now.toISOString(),
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
