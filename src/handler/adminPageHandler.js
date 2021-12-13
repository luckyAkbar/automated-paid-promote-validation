const renderAdminPage = (req, res) => {
  res.status(200).render('admin-page');
}

module.exports = { renderAdminPage };
