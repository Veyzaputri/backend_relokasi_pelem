import { where } from "sequelize";
import fs from "fs";
import path from "path";
import Tokoh from "../models/TokohModel.js";

export const getTokoh = async (req, res) => {
    try {
        const response = await Tokoh.findAll({order: [['createdAt', 'DESC']],});
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}

export const getTokohById = async (req, res) => {
    try {
        const tokoh = await Tokoh.findOne({
            where: { id_tokoh: req.params.id_tokoh }
        });

        if (!tokoh) {
            return res.status(404).json({ msg: "Tokoh tidak ditemukan" });
        }

        res.status(200).json(tokoh);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}

export const createTokoh = async (req, res) => {
  try {
    const {  nama_tokoh, jabatan} = req.body;
    
    // Validasi isi berita
    if (!nama_tokoh || jabatan.trim() === "") {
      return res.status(400).json({ msg: "nama tokoh / jabatan tidak boleh kosong" });
    }

    const gambar = req.file ? req.file.filename : null;

    await Tokoh.create({ nama_tokoh, jabatan, gambar });

    res.status(201).json({ msg: "Tokoh berhasil ditambahkan" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};


export const updateTokoh = async (req, res) => {
  try {
    const id = req.params.id_tokoh;
    const tokoh = await Tokoh.findByPk(id);
    if (!tokoh) return res.status(404).json({ msg: "Tokoh tidak ditemukan" });

    const { nama_tokoh, jabatan} = req.body;
    let fileName = tokoh.gambar;

    if (req.file) {
      const oldPath = path.join("public/uploads", tokoh.gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      fileName = req.file.filename;
    }

    await Tokoh.update(
      {
        nama_tokoh,
        jabatan,
        gambar: fileName,
      },
      { where: { id_tokoh: id } }
    );

    res.status(200).json({ msg: "Tokoh berhasil diperbarui" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const deleteTokoh = async (req, res) => {
    try {
        const tokoh = await Tokoh.findByPk(req.params.id_tokoh);
if (!tokoh) return res.status(404).json({ msg: "Tokoh tidak ditemukan" });

        await Tokoh.destroy({
            where: {
                id_tokoh: req.params.id_tokoh
            }
        });
        res.status(200).json({ msg: "Tokoh berhasil dihapus" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}