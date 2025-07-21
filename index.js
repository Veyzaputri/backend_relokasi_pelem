import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import BeritaRoutes from "./routes/BeritaRoutes.js";
import TokohRoutes from "./routes/TokohRoutes.js";
import fileUpload from "express-fileupload";
import path from "path";

dotenv.config();

const app = express();

// (Sinkronisasi database, sebaiknya hanya untuk development)
// (async()=>{
//     await db.sync();
// })();

// MIDDLEWARE PENTING - URUTAN INI HARUS BENAR
app.use(cors({
    credentials: true,
    origin: 'https://desa-relokasi-pelem.my.id' // Ganti dengan domain frontend Anda
}));

// Middleware untuk membaca JSON Body, letakkan sebelum routes
app.use(express.json());

app.use(fileUpload());
app.use(express.static("public"));

// Middleware untuk Session, letakkan sebelum routes
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto' // Otomatis secure jika di-deploy ke HTTPS
    }
    // Jika menggunakan SequelizeStore, konfigurasinya di sini
}));


// ROUTING
app.use(UserRoute);
app.use(BeritaRoutes);
app.use(TokohRoutes);


// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server up and running on port ${PORT}`);
});
