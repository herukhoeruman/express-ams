const mongoose = require("mongoose");
// const moment = require('moment-timezone');
// const asiaJakarta = moment().tz('Asia/Jakarta').format();

const notaDinasSchema = mongoose.Schema(
  {
    noNotaDinas: String,
    noAgenda: Number,
    tanggal: String,
    tahun: String,
    dari: String,
    kepada: [String],
    perihal: String,
    lampiran: String,
    kodeMasalah: String,
    sifat: String,
    keterangan: String,
    email: String,
    divisi: String,
    fileAttachment: String,
    flag: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinas", notaDinasSchema);
