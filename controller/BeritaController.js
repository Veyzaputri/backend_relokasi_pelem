import { where } from "sequelize";
import fs from "fs";
import path from "path";
import { put, del } from '@vercel/blob';
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
        if (!isi_berita || isi_berita.trim() === "") {
            return res.status(400).json({ msg: "Isi berita tidak boleh kosong" });
        }
        if (!req.file) {
            return res.status(400).json({ msg: "File gambar wajib di-upload" });
        }

        // 1. Upload file dari memori (req.file.buffer) ke Vercel Blob
        const { url } = await put(
            `berita/${req.file.originalname}`, // Nama file di Blob
            req.file.buffer,                  // Konten file
            { access: 'public' }              // Akses publik agar bisa dilihat
        );

        // 2. Simpan URL dari Blob ke database Neon Anda
        await Berita.create({
            isi_berita,
            gambar: url, // <-- Simpan URL-nya, bukan nama file
        });

        res.status(201).json({ msg: "Berita berhasil ditambahkan" });
    } catch (error) {
        console.error("Error saat membuat berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
};


export const updateBerita = async (req, res) => {
    try {
        const berita = await Berita.findByPk(req.params.id_berita);
        if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

        const { isi_berita } = req.body;
        let imageUrl = berita.gambar; // Defaultnya adalah URL gambar lama

        // Jika ada file baru yang di-upload
        if (req.file) {
            // 1. Hapus gambar lama dari Vercel Blob jika ada
            if (berita.gambar) {
                await del(berita.gambar);
            }
            // 2. Upload gambar baru
            const { url } = await put(
                `berita/${req.file.originalname}`,
                req.file.buffer,
                { access: 'public' }
            );
            imageUrl = url; // Gunakan URL baru
        }

        // 3. Update data di Neon dengan URL gambar yang sesuai
        await Berita.update({
            isi_berita,
            gambar: imageUrl,
        }, {
            where: { id_berita: req.params.id_berita }
        });

        res.status(200).json({ msg: "Berita berhasil diperbarui" });
    } catch (error) {
        console.error("Error saat update berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
};


// DELETE: Hapus file di Blob, lalu hapus data di Neon
export const deleteBerita = async (req, res) => {
    try {
        const berita = await Berita.findByPk(req.params.id_berita);
        if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

        // 1. Hapus gambar dari Vercel Blob menggunakan URL yang tersimpan
        if (berita.gambar) {
            await del(berita.gambar);
        }

        // 2. Hapus data dari database Neon
        await Berita.destroy({
            where: { id_berita: req.params.id_berita }
        });

        res.status(200).json({ msg: "Berita berhasil dihapus" });
    } catch (error) {
        console.error("Error saat hapus berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
}
