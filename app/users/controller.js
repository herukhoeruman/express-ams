const Users = require("../../app/users/model");
const bcrypt = require("bcryptjs");

module.exports = {
  index: async (req, res) => {
    try {
      const alertTitle = req.flash("alertTitle");
      const alertText = req.flash("alertText");
      const alertIcon = req.flash("alertIcon");
      const alert = {
        title: alertTitle,
        text: alertText,
        icon: alertIcon,
      };

      if (req.session.user === null || req.session.user === undefined) {
        res.render("users/login", {
          alert,
          title: "Login",
          username: "username",
          jabatan: "jabatan",
        });
      } else {
        res.render("dashboard", {
          title: "Dashboard",
          username: req.session.user.username,
          jabatan: req.session.user.jabatan,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },

  actionLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const check = await Users.findOne({ username: username });

      if (check) {
        const checkPassword = await bcrypt.compare(password, check.password);
        if (checkPassword) {
          req.session.user = {
            id: check._id,
            username: check.username,
            jabatan: check.jabatan,
            divisi: check.divisi,
          };
          res.redirect("/dashboard");
        } else {
          req.flash("alertTitle", "Password Salah!");
          req.flash("alertText", "Silahkan masukan Password dengan benar!");
          req.flash("alertIcon", "error");
          res.redirect("/");
        }
      } else {
        req.flash("alertTitle", "Username tidak ditemukan");
        req.flash("alertText", "Silahkan masukan Username dengan benar!");
        req.flash("alertIcon", "error");
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
    }
  },

  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
};
