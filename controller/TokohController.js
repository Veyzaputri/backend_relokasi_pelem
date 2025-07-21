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
        const tokoh = await Tokoh.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!tokoh) {
            return res.status(404).json({ msg: "Tokoh tidak ditemukan" });
        }

        let fileName = tokoh.gambar; // Default to the old image name

        // If a new file is uploaded, handle the file update
        if (req.files) {
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            fileName = file.md5 + ext;

            const allowedType = ['.png', '.jpg', '.jpeg'];

            if (!allowedType.includes(ext.toLowerCase())) {
                return res.status(422).json({ msg: "Invalid Images" });
            }
            if (fileSize > 5000000) {
                return res.status(422).json({ msg: "Image must be less than 5 MB" });
            }

            // Delete the old file
            const filepath = `./public/images/${tokoh.gambar}`;
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            // Save the new file
            file.mv(`./public/images/${fileName}`, (err) => {
                if (err) {
                    return res.status(500).json({ msg: err.message });
                }
            });
        }

        const { nama_tokoh, jabatan } = req.body;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

        await Tokoh.update({
            nama_tokoh: nama_tokoh,
            jabatan: jabatan,
            gambar: fileName, // This will be either the new fileName or the original one
            url: url
        }, {
            where: {
                id: req.params.id
            }
        });

        res.status(200).json({ msg: "Tokoh Berhasil diupdate" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
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
