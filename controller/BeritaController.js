import { put, del } from '@vercel/blob';
import Berita from "../models/BeritaModel.js";

// GET Semua Berita
export const getBerita = async (req, res) => {
    try {
        const response = await Berita.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
}

// GET Berita Berdasarkan ID
export const getBeritaById = async (req, res) => {
    try {
        // Menggunakan req.params.id agar konsisten
        const berita = await Berita.findOne({
            where: { id_berita: req.params.id }
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

// CREATE Berita Baru
export const createBerita = async (req, res) => {
    try {
        const { isi_berita } = req.body;
        if (!isi_berita || isi_berita.trim() === "") {
            return res.status(400).json({ msg: "Isi berita tidak boleh kosong" });
        }
        if (!req.file) {
            return res.status(400).json({ msg: "File gambar wajib di-upload" });
        }

        const fileName = `berita/${req.file.originalname}`;
        
        // 1. Upload file ke Vercel Blob dengan nama unik
        const { url } = await put(
            fileName,
            req.file.buffer, {
                access: 'public',
                addRandomSuffix: true, // <-- PERBAIKAN: Menjamin nama file selalu unik
            }
        );

        // 2. Simpan URL dari Blob ke database
        await Berita.create({
            isi_berita,
            gambar: url,
        });

        res.status(201).json({ msg: "Berita berhasil ditambahkan" });
    } catch (error) {
        console.error("Error saat membuat berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
};

// UPDATE Berita
export const updateBerita = async (req, res) => {
    try {
        // Menggunakan req.params.id agar konsisten
        const berita = await Berita.findByPk(req.params.id);
        if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

        const { isi_berita } = req.body;
        let imageUrl = berita.gambar; // Defaultnya adalah URL gambar lama

        // Jika ada file baru yang di-upload, timpa file lama
        if (req.file) {
            const fileName = `berita/${req.file.originalname}`;
            
            // Upload gambar baru dan timpa yang lama jika ada
            const { url } = await put(
                fileName, // Path/nama file di blob
                req.file.buffer, {
                    access: 'public',
                    allowOverwrite: true, // <-- PERBAIKAN: Izinkan menimpa file
                }
            );
            imageUrl = url; // Gunakan URL baru
        }

        // Update data di database dengan URL gambar yang sesuai
        await Berita.update({
            isi_berita,
            gambar: imageUrl,
        }, {
            where: { id_berita: req.params.id } // Menggunakan req.params.id
        });

        res.status(200).json({ msg: "Berita berhasil diperbarui" });
    } catch (error) {
        console.error("Error saat update berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
};

// DELETE Berita
export const deleteBerita = async (req, res) => {
    try {
        // Menggunakan req.params.id agar konsisten
        const berita = await Berita.findByPk(req.params.id);
        if (!berita) return res.status(404).json({ msg: "Berita tidak ditemukan" });

        // 1. Hapus gambar dari Vercel Blob menggunakan URL yang tersimpan
        if (berita.gambar) {
            await del(berita.gambar);
        }

        // 2. Hapus data dari database
        await Berita.destroy({
            where: { id_berita: req.params.id } // Menggunakan req.params.id
        });

        res.status(200).json({ msg: "Berita berhasil dihapus" });
    } catch (error) {
        console.error("Error saat hapus berita:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
    }
}
