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
    document: String,
    fileAttachment: String,
    dataResponse: {
      id: String,
      stamp: Array,
      sign: [
        {
          teken_id: String,
          email: String,
          url: String,
        },
      ],
    },
    flag: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinas", notaDinasSchema);
