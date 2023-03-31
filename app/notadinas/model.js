const mongoose = require("mongoose");
// const moment = require('moment-timezone');
// const asiaJakarta = moment().tz('Asia/Jakarta').format();

const notaDinasSchema = mongoose.Schema(
  {
    tahunAgenda: {
      type: String,
      require: [true, "tahun agenda tidak boleh kosong"],
    },
    noAgenda: {
      type: Number,
      require: [true, "no agenda tidak boleh kosong"],
    },
    unitAgenda: { type: Number },
    wilayahAgenda: { type: Number },
    noNotaDinas: {
      type: String,
      require: [true, "no nota dinas tidak boleh kosong"],
    },
    tglNotaDinas: { type: String },
    dari: {
      type: String,
      require: [true, "dari tidak boleh kosong"],
    },
    kepada: { type: String, require: [true, "kepada tidak boleh kosong"] },
    perihal: { type: String, require: [true, "perihal tidak boleh kosong"] },
    lampiranJumlah: { type: String },
    lampiranJenis: { type: String },
    lampiranFungsi: { type: String },
    kodeMasalah: {
      type: String,
      require: [true, "kode maslah tidak boleh kosong"],
    },
    sifat: { type: String },
    keterangan: { type: String },
    flagAttach: { type: String },
    simpanRuang: { type: String },
    simpanNoAlmari: { type: String },
    simpanNoOrder: { type: String },
    tglBuat: { type: String },
    userBuat: { type: String },
    tglUpdate: { type: String },
    userUpdate: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinas", notaDinasSchema);
