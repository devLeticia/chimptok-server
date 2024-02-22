const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

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
};
