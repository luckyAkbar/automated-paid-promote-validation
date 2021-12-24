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
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

const renderLoginPage = async (req, res) => {
  const { cookies } = req;

  try {
    const alreadyLoggedIn = await LoginHandler.checkIsAlreadyLoggedIn(cookies);
    
    if (alreadyLoggedIn) {
      res.redirect('/admin');
      return;
    }

    res.status(200).render('login-page');
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
}

module.exports = { loginHandler, renderLoginPage };
