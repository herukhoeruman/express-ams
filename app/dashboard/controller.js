module.exports = {
  index: async (req, res) => {
    try {
      res.render("dashboard/index", {
        title: "Dashboard",
        subtitle: "",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
