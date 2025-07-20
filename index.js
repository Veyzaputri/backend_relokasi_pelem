import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import BeritaRoutes from "./routes/BeritaRoutes.js";
import TokohRoutes from "./routes/TokohRoutes.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import User from "./models/UserModel.js"; // ⬅️ WAJIB: agar tabel User dikenali Sequelize

// Load .env
dotenv.config();

// Inisialisasi Express
const app = express();
app.set('trust proxy', 1);

// Middleware
app.use('/uploads', express.static(path.resolve('public/uploads')));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://desa-relokasi-pelem.my.id", // alamat Live Server kamu
  credentials: true, // penting untuk session cookie
}));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60, // 1 jam
    },
  })
);

// Routing
app.use(UserRoute);
app.use(BeritaRoutes);
app.use(TokohRoutes);

app.get("/cek-session", (req, res) => {
  res.json({ session: req.session });
});

app.get("/whoami", (req, res) => {
  res.json({
    userId: req.session.userId,
    username: req.session.username
  });
});
// Koneksi & Sync ke database
try {
  await db.authenticate();
  console.log("✅ Koneksi ke database berhasil");

  await db.sync(); // ⬅️ Ini yang bikin tabel otomatis
  console.log("✅ Tabel berhasil disinkronisasi");
} catch (error) {
  console.error("❌ Gagal koneksi atau sync:", error);
}

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://127.0.0.1:${PORT}`);
});
