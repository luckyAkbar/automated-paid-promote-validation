'use strict';

const assert = require('assert').strict;

const incorrectJSONFormatHandler = (err, req, res, next) => {
  try {
    assert.strictEqual(err, undefined);
  } catch (e) {
    res.status(400).json({ message: 'You have sent incorrect JSON format. Please fix and try it again' });
  }
};

module.exports = { incorrectJSONFormatHandler };