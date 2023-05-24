const { Sequelize } = require("sequelize");
const dbsql = require("../../database/mysql.js");

const { DataTypes } = Sequelize;

const Callback = dbsql.define(
  "callback",
  {
    json: DataTypes.STRING,
    status: DataTypes.STRING,
    code: DataTypes.STRING,
    document_id: DataTypes.STRING,
    signer_email: DataTypes.STRING,
    email: DataTypes.STRING,
    url: DataTypes.STRING,
    documet_file_name: DataTypes.STRING,
    document_owner_name: DataTypes.STRING,
    document_owner_email: DataTypes.STRING,
    download_url: DataTypes.STRING,
    signer_email: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);

module.exports = Callback;

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
