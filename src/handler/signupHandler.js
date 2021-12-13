'use strict';

const assert = require('assert').strict;
const CustomError = require('../classes/CustomError');
const Signup = require('../classes/Signup');

const signupHandler = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    assert.strictEqual(password, confirmPassword, new CustomError('Password did not match'));

    const signup = new Signup(email, password, 'user');
    await signup.createUser();

    res.status(201).json({ message: `User created. You can login with your new account now.` });
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

const renderSignupPage = (req, res) => {
  res.status(200).render('sign-up-page');
};

module.exports = { signupHandler, renderSignupPage };
