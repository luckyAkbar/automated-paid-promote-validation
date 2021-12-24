'use strict';

const Dashboard = require('../classes/Dashboard');

const mainDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderMainDashboard();
  } catch (e) {
    console.log(e);
  }
};

const renderAlreadyFilledParticipants = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderTotalParticipantsDashboard();
  } catch (e) {
    console.log(e);
  }
};

const imageParticipantDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.participantImageAccessHandler(req.params.imageName);
  } catch (e) {
    console.log(e);
  }
};

const validParticipantsDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderValidPartipantsDashboard();
  } catch (e) {
    console.log(e);
  }
};

const invalidParticipantsDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderInvalidParticipantsDashboard();
  } catch (e) {
    console.log(e);
  }
};

const finishedEventDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderFinishedEventDashboard();
  } catch (e) {
    console.log(e);
  }
};

const unfinishedEventDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.email, res);

    await dashboard.renderUnfinishedEventDashboard();
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  mainDashboard,
  renderAlreadyFilledParticipants,
  imageParticipantDashboard,
  validParticipantsDashboard,
  invalidParticipantsDashboard,
  finishedEventDashboard,
  unfinishedEventDashboard,
};
