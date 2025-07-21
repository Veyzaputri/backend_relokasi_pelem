import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import BeritaRoutes from "./routes/BeritaRoutes.js";
import TokohRoutes from "./routes/TokohRoutes.js";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// === MIDDLEWARE ===
app.use(cors({
  credentials: true,
  origin: "https://desa-relokasi-pelem.my.id"
}));



app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
// (Opsional: Sinkronisasi tabel session)
// await store.sync();

// === ROUTING ===
// Daftarkan route Anda SETELAH semua middleware di atas
app.use(UserRoute);
app.use(BeritaRoutes);
app.use(TokohRoutes);

app.get("/whoami", AuthMiddleware, async (req, res) => {
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
