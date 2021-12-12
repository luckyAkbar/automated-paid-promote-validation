'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { incorrectJSONFormatHandler } = require('./middleware/incorrectJSONFormatHandler');
const { router } = require('./routes/router');


const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ type: 'application/json' }), incorrectJSONFormatHandler);
app.use('/', router);

module.exports = { app };
