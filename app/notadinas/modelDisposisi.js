const mongoose = require("mongoose");

const disposisiMasterSchema = mongoose.Schema({
  kode: {
    type: String,
  },
  nama: {
    type: String,
  },
});

module.exports = mongoose.model("DisposisiMaster", disposisiMasterSchema);
