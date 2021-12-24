'use strict';

const Logout = require('../classes/Logout');

const logoutHandler = (req, res) => {
  try {
    const logout = new Logout(req, res);

    logout.deleteUserLoginToken();
  } catch (e) {
    console.log(e);
  }
};

module.exports = { logoutHandler };
