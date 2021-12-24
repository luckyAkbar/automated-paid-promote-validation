'use strict';
require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const assert = require('assert').strict;
const CustomError = require('./CustomError');
const User = require('../../models/users');
const Role = require('../../models/role');

class Auth {
  constructor(cookie, minimumAccessRight = 100) {
    this.minimumAccessRight = Number(minimumAccessRight);
    this.cookie = cookie;
    this.email = null;

    assert.notStrictEqual(this.cookie, {}, new CustomError('You are not logged in. Please log in first.', 403));
    assert.notStrictEqual(this.cookie, undefined, new CustomError('You are not logged in. Please log in first.', 403));
  };

  getUserEmail() {
    return this.email;
  }

  static async createHash(plainText) {
    try {
      const salt = await bcrypt.genSalt(Number(process.env.HASH_ROUND));
      const hashed = await bcrypt.hash(plainText, salt);

      return hashed;
    } catch (e) {
      throw new CustomError('System failed to create hash for user password.', 500);
    }
  };

  static async compareHash(plainText, hashed) {
    try {
      const result = await bcrypt.compare(plainText, hashed);
      assert.notStrictEqual(result, false);
    } catch (e) {
      throw new CustomError('Hash not equal', 403);
    }
  };

  static async createJWT(object, expiresIn) {
    assert.notStrictEqual(object, undefined, `Can't pass undefined data to create JWT`);
    return jwt.sign(object, process.env.SECRET_JWT_TOKEN, {
      expiresIn: Number(expiresIn),
    });
  }

  static async verifyJWT(JWTToken) {
    const result = jwt.verify(JWTToken, process.env.SECRET_JWT_TOKEN, (err, decoded) => {
      try {
        assert.strictEqual(err, null);
        return decoded;
      } catch (e) {
        throw new CustomError('Token invalid', 403);
      }
    });

    return result;
  };

  async _verifyCookie() {
    const result = jwt.verify(this.cookie[process.env.LOGIN_COOKIES_CODENAME], process.env.SECRET_JWT_TOKEN, (err, decoded) => {
      try {
        assert.strictEqual(err, null);
        return decoded;
      } catch (e) {
        throw new CustomError('Token invalid', 403);
      }
    });

    return result;
  }
  
  async _setRole() {
    try {
      assert.notStrictEqual(this.email, null);
      const result = await User.findOne({ email: this.email }, { _id: 0, role: 1 });

      assert.notStrictEqual(result, null);

      this.role = result.role;
    } catch (e) {
      throw new CustomError('Cookie invalid.', 403);
    }
  };

  async _getUserPermissionLevel() {
    try {
      assert.notStrictEqual(this.role, undefined, 'Role not set. Authentication failed');

      const result = await Role.findOne({ roleType: this.role }, { _id: 0, permissionLevel: 1 });
      assert.notStrictEqual(result, null, 'Role not found. Authentication failed');

      return result.permissionLevel;
    } catch (e) {
      throw new CustomError(e.message, 403);
    }
  }

  async _setEmailPropFromCookie() {
    try {
      const { email } = await this._verifyCookie();
      this.email = email;
    } catch (e) {
      throw new CustomError('Cookie invalid.', 403);
    }
  }

  async createLoginCheckerMiddleware() {
    try {
      await this._setEmailPropFromCookie();
      await this._setRole();
      
      const userPermissionLevel = await this._getUserPermissionLevel();

      assert.strictEqual((userPermissionLevel >= this.minimumAccessRight), true, `You don't have minimal permission to see this page.`);
    } catch (e) {
      throw new CustomError(e.message, 403);
    }
  };
}

module.exports = Auth;
