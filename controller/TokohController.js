// File: controllers/TokohController.js

import { put, del } from '@vercel/blob';
import Tokoh from "../models/TokohModel.js";

// GET ALL TOKOH
export const getTokoh = async (req, res) => {
    try {
        const response = await Tokoh.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(response);
    } catch (error) {
        console.error("Error getTokoh:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

// GET TOKOH BY ID
export const getTokohById = async (req, res) => {
    try {
        const tokoh = await Tokoh.findOne({ where: { id_tokoh: req.params.id_tokoh } });
        if (!tokoh) {
            return res.status(404).json({ msg: "Tokoh tidak ditemukan" });
        }
        res.status(200).json(tokoh);
    } catch (error) {
        console.error("Error getTokohById:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

// CREATE TOKOH
export const createTokoh = async (req, res) => {
    try {
        const { nama_tokoh, jabatan } = req.body;
        if (!nama_tokoh || !jabatan) {
            return res.status(400).json({ msg: "Nama dan jabatan tidak boleh kosong" });
        }
        if (!req.file) {
            return res.status(400).json({ msg: "File gambar wajib diunggah" });
        }

        // Upload file ke Vercel Blob
        const blob = await put(
            `tokoh/${Date.now()}-${req.file.originalname}`, // Nama file unik
            req.file.buffer, // Konten file dari multer
            { access: 'public' }
        );

        // Simpan URL dari blob ke database
        await Tokoh.create({
            nama_tokoh,
            jabatan,
            gambar: blob.url // Simpan URL blob
        });

        res.status(201).json({ msg: "Tokoh berhasil ditambahkan" });
    } catch (error) {
        console.error("Error createTokoh:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

// UPDATE TOKOH
export const updateTokoh = async (req, res) => {
    try {
        const tokoh = await Tokoh.findOne({ where: { id_tokoh: req.params.id_tokoh } });
        if (!tokoh) {
            return res.status(404).json({ msg: "Data Tokoh tidak ditemukan." });
        }

        const { nama_tokoh, jabatan } = req.body;
        if (!nama_tokoh || !jabatan) {
            return res.status(400).json({ msg: "Nama dan jabatan tidak boleh kosong" });
        }

        let newImageUrl = tokoh.gambar; // Defaultnya pakai gambar lama

        // Jika ada file baru yang diunggah, ganti gambarnya
        if (req.file) {
            // 1. Upload gambar baru ke Vercel Blob
            const newBlob = await put(
                `tokoh/${Date.now()}-${req.file.originalname}`,
                req.file.buffer,
                { access: 'public' }
            );
            newImageUrl = newBlob.url; // Dapatkan URL baru

            // 2. Hapus gambar lama dari Vercel Blob (jika ada)
            if (tokoh.gambar) {
                try {
                    await del(tokoh.gambar);
                } catch (delError) {
                    console.error("Gagal hapus gambar lama dari blob, mungkin sudah tidak ada:", delError.message);
                }
            }
        }

        // 3. Update data di database dengan URL gambar yang sesuai
        await Tokoh.update({
            nama_tokoh,
            jabatan,
            gambar: newImageUrl
        }, {
            where: { id_tokoh: req.params.id_tokoh }
        });

        res.status(200).json({ msg: "Tokoh berhasil diperbarui." });

    } catch (error) {
        console.error("Error updateTokoh:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};


// DELETE TOKOH
export const deleteTokoh = async (req, res) => {
    try {
        const tokoh = await Tokoh.findOne({ where: { id_tokoh: req.params.id_tokoh } });
        if (!tokoh) {
            return res.status(404).json({ msg: "Tokoh tidak ditemukan" });
        }

        // 1. Hapus gambar dari Vercel Blob
        if (tokoh.gambar) {
           try {
                await del(tokoh.gambar);
           } catch (delError) {
                console.error("Gagal hapus gambar dari blob:", delError.message);
           }
        }

        // 2. Hapus data dari database
        await Tokoh.destroy({ where: { id_tokoh: req.params.id_tokoh } });

        res.status(200).json({ msg: "Tokoh berhasil dihapus" });
    } catch (error) {
        console.error("Error deleteTokoh:", error.message);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};
