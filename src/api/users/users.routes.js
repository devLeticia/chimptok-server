const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById, toggleUserDarkMode, getUserInformation } = require('./users.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.password;
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/darkmode/:userId', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await findUserById(userId);

    toggleUserDarkMode(user.id);

    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/account-info/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const accountInfo = await getUserInformation(userId);

    res.json(accountInfo);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
