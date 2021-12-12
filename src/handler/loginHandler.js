'use strict';

const LoginHandler = require('../classes/LoginHandler');

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  const { cookies } = req;

  try {
    const userLoginHandler = new LoginHandler(email, password);
    userLoginHandler.rawLoginToken = cookies;

    await userLoginHandler.validateLoginToken();
    await userLoginHandler.validatePassword();
    await userLoginHandler.sendCookies(res);
    await userLoginHandler.registerNewSession();
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

module.exports = { loginHandler };
