const mongoose = require("mongoose");

const notaDinasSentShema = mongoose.Schema(
  {
    kode: {
      type: String,
    },
    pengirim: {
      type: String,
    },
    penerima: [
      {
        type: String,
      },
    ],
    notaDinasKode: {
      type: String,
    },
    sentKode: {
      type: String,
    },
    disposisi: [
      {
        type: String,
      },
    ],
    tindakLanjut: {
      type: String,
    },
    tanggal: {
      type: String,
    },
    kodeApp: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinasSent", notaDinasSentShema);
