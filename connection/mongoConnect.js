'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const mongoConnect = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Atlas connected.');
  } catch (e) {
    console.log('Failed, retrying....');
    await mongoConnect();
  }
};

module.exports = { mongoConnect };
