'use strict';

const LoginHandler = require('../classes/LoginHandler');

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  const { cookies } = req;
  
  try {
    const userLoginHandler = new LoginHandler(email, password, cookies);

    await userLoginHandler.validateLoginToken();
    await userLoginHandler.validatePassword();
    await userLoginHandler.setCookies(res);

    res.status(200).redirect('/admin');

    await userLoginHandler.registerNewSession();
  } catch (e) {
    console.log(e);
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

const renderLoginPage = async (req, res) => {
  const { cookies } = req;

  try {
    await LoginHandler.checkIsAlreadyLoggedIn(cookies);
    res.status(200).render('login-page');
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
}

module.exports = { loginHandler, renderLoginPage };
