'use strict';

const assert = require('assert').strict;
const noSQLSanitizer = require('mongo-sanitize');
const Validator = require('./Validator');
const Auth = require('./Auth');
const User = require('../../models/users');
const CustomError = require('./CustomError');

class Signup {
  constructor(emailAddress, plainPassword, role) {
    this.emailAddress = noSQLSanitizer(emailAddress);
    this._plainPassword = noSQLSanitizer(plainPassword);
    this.role = noSQLSanitizer(role);
    this._validate();
  };

  _validate() {
    assert.notStrictEqual(this.role, undefined, new CustomError('New user cannot be created due to programming error in login handler.', 403));
    assert.notStrictEqual(this.emailAddress, undefined, new CustomError('Email address must not empty.', 403));
    assert.notStrictEqual(this._plainPassword, undefined, new CustomError('Password must not be empty', 403));
    assert.strictEqual(process.env.AVAILABLE_ROLES.split(',').includes(this.role), true, new CustomError(`Role ${this.role} is not exists.`, 403));
    Validator.emailAddress(this.emailAddress);
    Validator.passwordLength(this._plainPassword);
  };

  async _checkIsEmailAlreadyUsed() {
    try {
      const result = await User.findOne({ email: this.emailAddress });
      assert.strictEqual(result, null, `Email: ${this.emailAddress} is already used. Please use another`);
    } catch (e) {
      throw new CustomError(e.message, 403);
    }
  };

  async createUser() {
    try {
      await this._checkIsEmailAlreadyUsed();
      const hashedPassword = await Auth.createHash(this._plainPassword);
      const newUser = new User({
        email: this.emailAddress,
        password: hashedPassword,
        role: this.role,
      });

      await newUser.save();
    } catch (e) {
      throw new CustomError(e.message, 500);
    }
  };
}

module.exports = Signup;
