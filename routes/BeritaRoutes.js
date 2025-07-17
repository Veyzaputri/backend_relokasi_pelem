import multer from "multer";
// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Pastikan folder ini ada
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

import express from "express";
import {
    getBerita,
    getBeritaById,
    createBerita,
    updateBerita,
    deleteBerita
} from "../controller/BeritaController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();
router.get("/berita", getBerita);
router.get("/berita/:id_berita",authMiddleware, getBeritaById);
router.post("/add-berita",authMiddleware, upload.single('file'), createBerita);
router.put("/berita/:id_berita",authMiddleware, upload.single("file"), updateBerita);
router.delete("/berita/:id_berita",authMiddleware, deleteBerita);

export default router;