'use strict';

const Auth = require('../classes/Auth');
const CustomError = require('../classes/CustomError');

const checkLoginStatus = async (req, res, next) => {
  const { cookies } = req;

  try {
    const loginChecker = new Auth(cookies, Number(process.env.LOGIN_REQUIRED_ROUTE_MINIMUM_PERMISSION));
    await loginChecker.createLoginCheckerMiddleware();
    next()
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
    return;
  }
};

module.exports = { checkLoginStatus };
