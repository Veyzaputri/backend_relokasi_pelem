import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Berita = db.define('berita', {
  id_berita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  isi_berita: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  gambar: {
    type: DataTypes.STRING,
    allowNull: true // kalau gambar opsional
  }
}, {
  tableName: 'berita',
  freezeTableName: true,
  timestamps: true // aktifkan jika ingin pakai createdAt & updatedAt
});

export default Berita;

