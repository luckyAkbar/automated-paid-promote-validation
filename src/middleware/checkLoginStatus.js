'use strict';
require('dotenv').config();

const Auth = require('../classes/Auth');

const checkLoginStatus = async (req, res, next) => {
  const { cookies } = req;

  try {
    const loginChecker = new Auth(cookies, Number(process.env.LOGIN_REQUIRED_ROUTE_MINIMUM_PERMISSION));
    await loginChecker.createLoginCheckerMiddleware();
    next();
  } catch (e) {
    res.status(e.HTTPErrorStatus).redirect('/login');
    return;
  }
};

module.exports = { checkLoginStatus };
