const mongoose = require("mongoose");

const notaDinasSchema = mongoose.Schema(
  {
    noNotaDinas: String,
    noAgenda: Number,
    noAgendaSisipan: Number,
    tanggal: String,
    date: Date,
    tahun: Number,
    dari: String,
    kepada: String,
    pemeriksa: String,
    pengirim: String,
    perihal: String,
    jumlahLampiran: {
      type: Number,
      default: 0,
    },
    jenisLampiran: {
      type: String,
      default: " ",
    },
    kodeKlasifikasi: String,
    sifatPenyampaian: {
      type: String,
      default: "-",
    },
    sifatPengamanan: {
      type: String,
      default: "-",
    },
    isiSurat: String,
    tembusan: [String],
    email: String,
    divisi: String,
    document: String,
    attachment: String,
    disposisi: [
      {
        pengirim: String,
        penerima: String,
        disposisi: [String],
        tindakLanjut: String,
        tanggal: String,
      },
    ],
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
    flag: Number, // 1: dikirim, 2: ditandatangani 3: ditolak 4: konsep
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinas", notaDinasSchema);
