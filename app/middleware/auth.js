module.exports = {
  isLogin: (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash("alertTitle", "Sesi telah habis");
      req.flash("alertText", "Sesi anda telah habis, silahkan login kembali");
      req.flash("alertIcon", "error");
      res.redirect("/");
    } else {
      next();
    }
  },
};
