import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Tokoh = db.define('tokoh', {
  id_tokoh: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_tokoh: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  jabatan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  gambar: {
    type: DataTypes.STRING,
    allowNull: true // kalau gambar opsional
  }
}, {
  tableName: 'tokoh',
  freezeTableName: true,
  timestamps: true // aktifkan jika ingin pakai createdAt & updatedAt
});

export default Tokoh;

