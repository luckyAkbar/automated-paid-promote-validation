'use strict';

const mongoose = require('mongoose');

const role = new mongoose.Schema({
  roleType: {
    type: String,
    required: true,
    unique: true,
    enum: process.env.AVAILABLE_ROLES.split(','),
  },

  permissionLevel: {
    type: Number,
    max: 100,
    min: 0,
  },
});

const Role = mongoose.model('Role', role);

module.exports = Role;
