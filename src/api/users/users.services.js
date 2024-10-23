const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');
const crypto = require('crypto');

async function saveCancelationReason(user, reasonIds, comment) {
  try {
    const reasons = await db.cancelationReason.findMany({
      where: {
        id: {
          in: reasonIds
        }
      }
    });
    await db.cancelation.create({
      data: {
        userEmail: user.email,
        accountCreatedAt: user.createdAt,
        comment: comment || '',
        reasons: {
          connect: reasons.map(reason => ({ id: reason.id }))
        }
      }
    });
  } catch (error) {
    console.error('Error saving cancellation reason:', error);
    throw error;
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

// function updateUserPassword(user, newPassowrd) {
//   return db.user.update({
//     where: {
//       id: user.id,
//     },
//     data: {
//       password: newPassowrd,
//     },
//   });
// }

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

// Save the hashed reset token and expiry time in the user's record
const updateUserResetToken = async (email, hashedToken, tokenExpiry) => {
  return db.user.update({
    where: { email: email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: new Date(tokenExpiry),
    },
  });
};



const findUserByResetToken = async (token) => {
  const users = await db.user.findMany();
  for (const user of users) {
    const isValid = await bcrypt.compare(token, user.passwordResetToken);
    if (isValid) {
      return user;
    }
  }
  return null;
};

// Update the user's password
const updateUserPassword = async (userId, newPassword) => {
  return db.user.update({
    where: { id: userId },
    data: {
      password: newPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  });
};
const savePasswordResetToken = async (userEmail, resetToken, resetTokenExpiry) => {
  // const resetToken = generateResetToken();
  // const resetTokenExpiry = new Date(Date.now() + 3600000); // Token expires in 1 hour (set as a Date object)

  // Store the token and expiry date in the user's record in the database using Prisma
  await db.user.update({
    where: {
      email: userEmail,
    },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry, // Prisma expects a Date type
    },
  });

  return resetToken; // Return to send in the email
};

const generateResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);  // Hash the tokeWn before saving
  return { resetToken, hashedToken };
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  findUserByConfirmationCode,
  confirmUserEmail,
  toggleUserDarkMode,
  findUserByResetCode,
  revokeRefreshTokens,
  getUserInformation,
  saveCancelationReason,
  getCancelationReasons,
  deleteUser,
  updateUserPassword,
  updateUserResetToken,
  findUserByResetToken,
  updateUserPassword,
  savePasswordResetToken
};
