const mongoose = require("mongoose");
// const autoIncrement = require("mongoose-auto-increment");

let userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: [true, "username tidak boleh kosong"],
    },
    password: {
      type: String,
      require: [true, "password tidak boleh kosong"],
    },
    jabatan: {
      type: String,
    },
    tglDaftar: {
      type: String,
    },
    wilayah: {
      type: String,
    },
    deskripsi: {
      type: String,
    },
    tglBuat: {
      type: String,
    },
    userBuat: {
      type: String,
    },
    tglUpdate: {
      type: String,
    },
    userUpdate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
