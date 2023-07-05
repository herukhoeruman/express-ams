const mongoose = require("mongoose");
// const moment = require('moment-timezone');
// const asiaJakarta = moment().tz('Asia/Jakarta').format();

const klasifikasiSchema = mongoose.Schema(
  {
    jenis: String,
    klasifikasi: [
      {
        kode: String,
        jenis: String,
        keterangan: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Klasifikasi", klasifikasiSchema);
