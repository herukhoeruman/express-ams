const { Sequelize } = require("sequelize");

// Buat koneksi ke database MySQL
const dbsql = new Sequelize("plnr6871_callback", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = dbsql;
