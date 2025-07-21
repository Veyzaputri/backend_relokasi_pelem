// File: routes/TokohRoutes.js

import express from "express";
import multer from "multer";
import {
    getTokoh,
    getTokohById,
    createTokoh,
    updateTokoh,
    deleteTokoh
} from "../controller/TokohController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Konfigurasi multer untuk menangani satu file dengan nama field 'file'
const upload = multer({ storage: multer.memoryStorage() }).single('file');

// Definisikan rute Anda
router.get('/tokoh', getTokoh);
router.get('/tokoh/:id_tokoh', getTokohById);

// Gunakan middleware 'upload' untuk rute yang membutuhkan file
router.post('/tokoh', authMiddleware, upload, createTokoh);
router.put('/tokoh/:id_tokoh', authMiddleware, upload, updateTokoh);

router.delete('/tokoh/:id_tokoh', authMiddleware, deleteTokoh);

export default router;
