// File: index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Middleware untuk menangani file, gantikan express-fileupload
import multer from "multer";

import db from "./config/Database.js";
import { authMiddleware } from "./middleware/AuthMiddleware.js";
import UserRoute from "./routes/UserRoute.js";
import BeritaRoutes from "./routes/BeritaRoutes.js";
import TokohRoutes from "./routes/TokohRoutes.js";
import User from "./models/UserModel.js";

dotenv.config();
const app = express();

// Konfigurasi Multer untuk menyimpan file di memory (buffer)
const upload = multer({ storage: multer.memoryStorage() });

// === KONEKSI DATABASE (jika ada) ===
(async () => {
    try {
        await db.authenticate();
        console.log('Database Connected...');
    } catch (error) {
        console.error('Connection Error:', error);
    }
})();


// === MIDDLEWARE ===
app.use(cors({
    credentials: true,
    origin: "https://desa-relokasi-pelem.my.id"
}));

app.use(cookieParser());
app.use(express.json()); // Middleware untuk membaca body JSON
app.use(express.static("public"));

// === ROUTING ===
// Gunakan route Anda di sini
app.use(UserRoute);
app.use(BeritaRoutes);
// Penting: TokohRoutes akan kita modifikasi agar menggunakan 'upload'
app.use(TokohRoutes);

// Endpoint Whoami
app.get("/whoami", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ["id", "username"]
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
