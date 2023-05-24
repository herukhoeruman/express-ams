const { Sequelize } = require("sequelize");
const dbsql = require("../../database/mysql.js");

const { DataTypes } = Sequelize;

const ReqPosisi = dbsql.define(
  "req_setposisi",
  {
    kode: DataTypes.STRING,
    file_name: DataTypes.STRING,
    file_path: DataTypes.STRING,
    signature: DataTypes.STRING,
    ematerai: DataTypes.STRING,
    estamp: DataTypes.STRING,
    client_id: DataTypes.STRING,
    client_ref_num: DataTypes.STRING,
    timestamp: DataTypes.STRING,
    trx_id: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);

module.exports = ReqPosisi;

(async () => {
  await dbsql.sync();
})();

// Sinkronisasi model dengan database
// dbsql.sync()
//   .then(() => {
//     console.log('Model telah disinkronkan dengan database.');
//   })
//   .catch((error) => {
//     console.error('Gagal menyinkronkan model dengan database:', error);
//   });
