'use strict';

require('dotenv').config();

class Logout {
  constructor(requestObj, responseObj) {
    this.req = requestObj;
    this.res = responseObj;
  }

  deleteUserLoginToken() {
    this.res.cookie(
      process.env.LOGIN_COOKIES_CODENAME,
      '-', {
        maxAge: 1,
        httpOnly: true,
      },
    ).redirect('/login');
  };
};

module.exports = Logout;
