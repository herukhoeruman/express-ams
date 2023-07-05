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
    pemeriksa: String,
    perihal: String,
    lampiran: String,
    kodeKlasifikasi: String,
    sifat: String,
    email: String,
    divisi: String,
    document: String,
    fileAttachment: String,
    disposisi: String,
    keterangan: String,
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
