const mongoose = require("mongoose");

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
    namaLengkap: { type: String },
    email: { type: String },
    nomorTlp: { type: String },
    divisi: { type: String },
    role: { type: String },
    jabatan: {
      kodeUnit: String,
      namaUnit: String,
      kodeSejab: String,
      sebutanJabatan: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
