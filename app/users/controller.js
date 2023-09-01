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
        res.render("auth/login", {
          alert,
          title: "Login",
          username: "username",
          jabatan: "jabatan",
        });
      } else {
        res.render("dashboard", {
          title: "Dashboard",
          subtitle: "",
          count: 0,
          namaLengkap: req.session.user.namaLengkap,
          username: req.session.user.username,
          jabatan: req.session.user.jabatan,
          email: req.session.user.email,
          role: req.session.user.role,
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
            namaLengkap: check.namaLengkap,
            username: check.username,
            jabatan: check.jabatan,
            divisi: check.divisi,
            email: check.email,
            role: check.role,
          };
          res.redirect("/dashboard");
        } else {
          req.flash("alertTitle", "Password Salah!");
          req.flash("alertText", "Silahkan masukan Password dengan benar!");
          req.flash("alertIcon", "error");
          res.redirect("/");
        }
      } else {
        req.flash("alertTitle", "User tidak ditemukan");
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

  viewProfile: async (req, res) => {
    try {
      const { username } = req.params;

      const profile = await Users.findOne({ username: username });
      const users = await Users.find();

      res.render("users/profile", {
        profile,
        users,
        title: "Account Profile",
        subtitle: "",
        count: 0,
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        email: req.session.user.email,
        role: req.session.user.role,
      });
    } catch (error) {
      console.log(error);
    }
  },

  actionChangePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword, retypePassword, currentPassword } = req.body;

      const user = await Users.findById({ _id: id });

      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Password saat ini salah" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await Users.findByIdAndUpdate(
        { _id: id },
        { password: hashedNewPassword }
      );

      res.status(200).json({ message: "Password berhasil diubah" });
    } catch (error) {
      console.log(error);
    }
  },

  actionUpdateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        username,
        namaLengkap,
        email,
        nomorTlp,
        namaUnit,
        kodeSejab,
        sebutanJabatan,
      } = req.body;

      const jabatan = {
        namaUnit,
        kodeSejab,
        sebutanJabatan,
      };

      const isUser = await Users.findOne({ _id: id });

      if (!isUser) {
        return res.status(401).json({ message: "Pengguna tidak ditemukan" });
      }

      await Users.findByIdAndUpdate(
        { _id: id },
        {
          username,
          namaLengkap,
          email,
          nomorTlp,
          jabatan,
        }
      );

      res.status(200).json({ message: "Profil berhasil diubah" });
    } catch (error) {
      console.log(error);
    }
  },
};
