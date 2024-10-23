const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const goals = require('./goals/goals.routes');
const cycles = require('./cycles/cycles.routes');
const reports = require('./reports/reports.routes');
const home = require('./home/home.routes');

router.use('/auth', auth);
router.use('/users', users);
router.use('/goals', goals);
router.use('/cycles', cycles);
router.use('/reports', reports);
router.use('/home', home);

module.exports = router;
