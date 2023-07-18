const mongoose = require("mongoose");

const notaDinasSchema = mongoose.Schema(
  {
    noNotaDinas: String,
    noAgenda: Number,
    tanggal: String,
    tahun: Number,
    dari: String,
    kepada: String,
    pemeriksa: String,
    pengirim: String,
    perihal: String,
    jumlahLampiran: Number,
    jenisLampiran: String,
    kodeKlasifikasi: String,
    sifat: String,
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
    flag: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinas", notaDinasSchema);
