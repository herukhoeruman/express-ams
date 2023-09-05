const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Import fs module
const path = require("path"); // Import path module

const Users = require("../users/model");
const config = require("../../config");

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

      const users = await Users.find();

      res.render("users/index", {
        alert,
        users,
        title: "Data Users",
        subtitle: "Nota Dinas Masuk",
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
    }
  },

  create: async (req, res) => {
    try {
      const {
        username,
        email,
        nomorTlp,
        namaUnit,
        kodeUnit,
        kodeSejab,
        sebutanJabatan,
        role,
      } = req.body;
      const jabatan = {
        kodeUnit,
        namaUnit,
        kodeSejab,
        sebutanJabatan,
      };

      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

      // Generate random password
      let password = "";
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      console.log("[PASWORD]", password);
      console.log("[USERNAME]", username);
      console.log("[PASWORD_HASH]", passwordHash);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user:  process.env.EMAIL_USER,
          pass:  process.env.EMAIL_PASS,
        },
      });

      const emailTemplatePath = path.resolve(
        config.rootPath,
        `public/html/email-template.html`
      );

      const emailTemplate = await fs.readFile(emailTemplatePath, "utf-8");
      const html = emailTemplate
        .replace("{{password}}", password)
        .replace("{{username}}", username);

      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password default Aplikasi AMS",
        text: "Hello world?",
        html: html,
      });

      console.log("Message sent: %s", info.messageId);

      // main().catch(console.error);

      const user = new Users({
        username,
        password: passwordHash,
        email,
        nomorTlp,
        jabatan,
        role,
      });
      await user.save();

      req.flash("alertTitle", "Success!");
      req.flash("alertText", "Berhasil menambahkan data baru!");
      req.flash("alertIcon", "success");
      res.redirect("/users");
    } catch (err) {
      req.flash("alertTitle", "Gagal!");
      req.flash("alertText", "Gagal menambahkan data baru!");
      req.flash("alertIcon", "error");
      res.redirect("/users");
      console.log(err);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        namaUnit,
        kodeUnit,
        kodeSejab,
        sebutanJabatan,
        role,
      } = req.body;
      const jabatan = {
        kodeUnit,
        namaUnit,
        kodeSejab,
        sebutanJabatan,
      };

      await Users.findByIdAndUpdate(id, {
        username,
        email,
        jabatan,
        role,
      });

      console.log(id);

      req.flash("alertTitle", "Success!");
      req.flash("alertText", "Berhasil mengedit data!");
      req.flash("alertIcon", "success");
      res.redirect("/users");
    } catch (err) {
      console.log(err);
    }
  },

  hapus: async (req, res) => {
    try {
      const { id } = req.params;

      await Users.findByIdAndDelete(id);
      req.flash("alertTitle", "Success!");
      req.flash("alertText", "Berhasil menghapus data!");
      req.flash("alertIcon", "success");
      res.redirect("/users");
    } catch (err) {
      console.log(err);
    }
  },
};
