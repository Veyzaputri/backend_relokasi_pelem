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
    getTokoh,
    getTokohById,
    createTokoh,
    updateTokoh,
    deleteTokoh
} from "../controller/TokohController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();
router.get("/tokoh", getTokoh);
router.get("/tokoh/:id_tokoh",authMiddleware, getTokohById);
router.post("/add-tokoh",authMiddleware, upload.single('file'), createTokoh);
router.put("/tokoh/:id_tokoh",authMiddleware, upload.single("file"), updateTokoh);
router.delete("/tokoh/:id_tokoh",authMiddleware, deleteTokoh);

export default router;