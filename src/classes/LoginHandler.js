'use strict';

const assert = require('assert').strict;
const noSQLSanitizer = require('mongo-sanitize');
const User = require('../../models/users');
const CustomError = require('./CustomError');
const Auth = require('./Auth');
const LoginSession = require('../../models/loginSession');

class LoginHandler {
  constructor(email, plainPassword, cookies) {
    this.email = noSQLSanitizer(email);
    this._plainPassword = noSQLSanitizer(plainPassword);
    this.loginToken = noSQLSanitizer(cookies[process.env.LOGIN_COOKIES_CODENAME]);
    this.JWTLoginCookies = null;

    this._validate();
  };

  static async clearOldLoginSession() {
    try {
      await LoginSession.deleteMany({ expiredAt: { $lte: Date.now() }})
    } catch (e) {
      console.log('System failed to delete expired login session. This may caused DB to store junk.', e)
    }
  };

  static async checkIsAlreadyLoggedIn(cookies) {
    if (cookies[process.env.LOGIN_COOKIES_CODENAME] === undefined) return false;

    try {
      await Auth.verifyJWT(cookies[process.env.LOGIN_COOKIES_CODENAME]);
      return true;
    } catch (e) {
      throw new CustomError('Your cookies are invalid. Please relogin.', 400);
    }
  }

  _validate() {
    assert.notStrictEqual(this.email, undefined, new CustomError('Please use your registered email to login.'));
    assert.notStrictEqual(this._plainPassword, undefined, new CustomError('Please use your password to login.'));
  }

  async _getUserPassword() {
    try {
      const result = await User.findOne({
        email: this.email,
      }, {
        _id: 0,
        password: 1,
      });

      assert.notStrictEqual(result, null);
      assert.notStrictEqual(this._plainPassword, undefined);

      return result.password;
    } catch (e) {
      throw new CustomError('User not found.', 404);
    }
  };

  async _createLoginCookies() {
    return Auth.createJWT({
      email: this.email,
    }, process.env.JWT_LOGIN_COOKIE_EXPIRES_SEC);
  };

  async validatePassword() {
    try {
      const hashedPassword = await this._getUserPassword();
      await Auth.compareHash(this._plainPassword, hashedPassword);
    } catch (e) {
      throw new CustomError('Your password does not match.', 403);
    }
  };

  async setCookies(res) {
    this.JWTLoginCookies = await this._createLoginCookies();

    res.cookie(process.env.LOGIN_COOKIES_CODENAME, this.JWTLoginCookies, {
      maxAge: Number(process.env.JWT_LOGIN_COOKIE_EXPIRES_SEC) * 1000,
      httpOnly: true,
    });
  };

  async registerNewSession() {
    try {
      const loginSession = new LoginSession({
        issuer: this.email,
        rawJWT: this.JWTLoginCookies,
      });

      await loginSession.save();
    } catch (e) {
      console.log('System failed to register new login session. This may result user not able to log in.', e);
    }
  };

  async validateLoginToken() {
    if (this.loginToken === null) return;
    if (this.loginToken === undefined) return;

    try {
      await Auth.verifyJWT(this.loginToken);
    } catch (e) {
      throw new CustomError('Your cookies is invalid.', 403);
    }
  }
}

module.exports = LoginHandler;
