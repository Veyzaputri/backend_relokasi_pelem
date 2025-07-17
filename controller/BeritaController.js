import { where } from "sequelize";
import fs from "fs";
import path from "path";
import Berita from "../models/BeritaModel.js";

export const getBerita = async (req, res) => {
    try {
        const response = await Berita.findAll({order: [['createdAt', 'DESC']],});
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}

export const getBeritaById = async (req, res) => {
    try {
        const berita = await Berita.findOne({
            where: { id_berita: req.params.id_berita }
        });

        if (!berita) {
            return res.status(404).json({ msg: "Berita tidak ditemukan" });
        }

        res.status(200).json(berita);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}

export const createBerita = async (req, res) => {
  try {
    const { isi_berita } = req.body;
    
    // Validasi isi berita
    if (!isi_berita || isi_berita.trim() === "") {
      return res.status(400).json({ msg: "Isi berita tidak boleh kosong" });
    }

    const gambar = req.file ? req.file.filename : null;

    await Berita.create({ isi_berita, gambar });

    res.status(201).json({ msg: "Berita berhasil ditambahkan" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};


export const updateBerita = async (req, res) => {
  try {
    const id = req.params.id_berita;
    const berita = await Berita.findByPk(id);
    if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

    const { isi_berita } = req.body;
    let fileName = berita.gambar;

    if (req.file) {
      const oldPath = path.join("public/uploads", berita.gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      fileName = req.file.filename;
    }

    await Berita.update(
      {
        isi_berita,
        gambar: fileName,
      },
      { where: { id_berita: id } }
    );

    res.status(200).json({ msg: "Berita berhasil diperbarui" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const deleteBerita = async (req, res) => {
    try {
        const berita = await Berita.findByPk(req.params.id_berita);
if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

        await Berita.destroy({
            where: {
                id_berita: req.params.id_berita
            }
        });
        res.status(200).json({ msg: "Berita berhasil dihapus" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}