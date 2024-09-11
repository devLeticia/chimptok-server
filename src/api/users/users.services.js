const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');


async function saveCancelationReason(user, reasonIds, comment) {
  try {


    const reasons = await db.cancelationReason.findMany({
      where: {
        id: {
          in: reasonIds
        }
      }
    });
   
    console.log('----------', user)

    await db.cancelation.create({
      data: {
        userEmail: user.email, // Ensure userEmail is included
        accountCreatedAt: user.createdAt, // Ensure accountCreatedAt is included
        comment: comment || '',
        reasons: {
          connect: reasons.map(reason => ({ id: reason.id }))
        }
      }
    });
  } catch (error) {
    console.error('Error saving cancellation reason:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

function getCancelationReasons () {
  const reasons = db.cancelationReason.findMany();
  return reasons
}
function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

function findUserByConfirmationCode(confirmationCode) {
  return db.user.findUnique({
    where: {
      confirmationCode,
    },
  });
}

function findUserByResetCode(resetCode) {
  return db.user.findUnique({
    where: {
      resetCode,
    },
  });
}

function confirmUserEmail(confirmationCode) {
  return db.user.update({
    where: {
      confirmationCode,
    },
    data: {
      emailConfirmed: true,
    },
  });
}

function toggleUserDarkMode(id) {
  return db.user.update({
    where: {
      id,
    },
    data: {
      isDarkMode: !true,
    },
  });
}

function updateUserPassword(user, newPassowrd) {
  return db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newPassowrd,
    },
  });
}

async function revokeRefreshTokens(userId) {
  await db.refreshToken.updateMany({
    where: {
      userId,
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });
}



function daysPassedSince(dateString) {
  // Convert the dateString to a Date object
  const inputDate = new Date(dateString);

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = currentDate.getTime() - inputDate.getTime();

  // Convert milliseconds to days
  const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysPassed;
}
async function getUserInformation(userId) {
  const user = await findUserById(userId);
  const { createdAt } = user;

  const accountInfo = {
    daysSinceSubscription: daysPassedSince(createdAt),
    user,
  };

  return accountInfo;
}



async function deleteUser (userId) {
  await db.user.delete({
    where: { id: userId }
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  findUserByConfirmationCode,
  confirmUserEmail,
  toggleUserDarkMode,
  updateUserPassword,
  findUserByResetCode,
  revokeRefreshTokens,
  getUserInformation,
  saveCancelationReason,
  getCancelationReasons,
  deleteUser
};
