'use strict';

const Signup = require('../classes/Signup');

const signupHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const signup = new Signup(email, password, 'user');
    await signup.createUser();

    res.status(201).json({ message: `User created. You can login with your new account now.` });
  } catch (e) {
    console.log(e);
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

module.exports = { signupHandler };
