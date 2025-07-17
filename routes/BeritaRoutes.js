import express from "express";
import {
    getBerita,
    getBeritaById,
    createBerita,
    updateBerita,
    deleteBerita,
} from "../controllers/BeritaController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const router = express.Router();

// Konfigurasi Multer untuk memproses file di memori, bukan di disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Terapkan middleware 'upload' hanya pada route yang membutuhkan upload file
router.get('/berita', getBerita);
router.get('/berita/:id_berita', getBeritaById);
// Gunakan upload.single('gambar') untuk menerima satu file dengan nama field 'gambar'
router.post('/berita', upload.single('file'), createBerita);
router.patch('/berita/:id_berita', upload.single('file'), updateBerita);
router.delete('/berita/:id_berita', deleteBerita);

export default router;
