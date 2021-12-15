'use strict';

require('dotenv').config();
const { app } = require('./src/app');
const { mongoConnect } = require('./connection/mongoConnect');

app.listen(process.env.PORT, async () => {
  try {
    await mongoConnect();
    console.log(`Server is listening on port ${process.env.PORT}`);
  } catch (e) {
    console.log('Server failed to start.', e);
    process.exit(-1);
  }
});
