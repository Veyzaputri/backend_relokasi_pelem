import { where } from "sequelize";
import fs from "fs";
import path from "path";
import { put, del } from '@vercel/blob';
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
    
    // Validasi isi tokoh
    if (!nama_tokoh || nama_tokoh.trim() === "") {
    return res.status(400).json({ msg: "Nama tokoh tidak boleh kosong" });
}
if (!jabatan || jabatan.trim() === "") {
    return res.status(400).json({ msg: "Jabatan tidak boleh kosong" });
}
    if (!req.file) {
            return res.status(400).json({ msg: "File gambar wajib di-upload" });
        }
    
    const { url } = await put(
            `tokoh/${req.file.originalname}`, // Nama file di Blob
            req.file.buffer,                  // Konten file
            { access: 'public' }              // Akses publik agar bisa dilihat
        );
    await Tokoh.create({ nama_tokoh, jabatan, gambar:url, });

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

    const { nama_tokoh, jabatan } = req.body;
    let imageUrl = tokoh.gambar;

    if (req.file) {
      try {
        if (tokoh.gambar) {
          const parsedUrl = new URL(tokoh.gambar);
          await del(parsedUrl.pathname); // ✅ Aman
        }
      } catch (err) {
        console.error("Gagal menghapus gambar lama:", err.message);
      }

      try {
        const { url } = await put(
          `tokoh/${req.file.originalname}`,
          req.file.buffer,
          { access: 'public' }
        );
        imageUrl = url;
      } catch (err) {
        console.error("Gagal meng-upload gambar baru:", err.message);
        return res.status(500).json({ msg: "Gagal meng-upload gambar baru" });
      }
    }

    await Tokoh.update(
      {
        nama_tokoh,
        jabatan,
        gambar: imageUrl,
      },
      { where: { id_tokoh: id } }
    );

    res.status(200).json({ msg: "Tokoh berhasil diperbarui" });
  } catch (error) {
    console.error("Error updateTokoh:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};


export const deleteTokoh = async (req, res) => {
    try {
        const tokoh = await Tokoh.findByPk(req.params.id_tokoh);
if (!tokoh) return res.status(404).json({ msg: "Tokoh tidak ditemukan" });

        if (tokoh.gambar) {
    try {
        const parsedUrl = new URL(tokoh.gambar);
        await del(parsedUrl.pathname);
    } catch (err) {
        console.error("Gagal hapus gambar dari blob:", err.message);
    }
}

        // 2. Hapus data dari database Neon
        await Tokoh.destroy({
            where: { id_tokoh: req.params.id_tokoh }
        });

        res.status(200).json({ msg: "Tokoh berhasil dihapus" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}
