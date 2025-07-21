import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
// Pastikan semua file route Anda diimpor dengan benar
// import BeritaRoutes from "./routes/BeritaRoutes.js"; 
// import TokohRoutes from "./routes/TokohRoutes.js";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();
const store = new SequelizeStore(session.Store)({ db: db });

// === URUTAN MIDDLEWARE INI SANGAT PENTING ===

// 1. CORS: Izinkan permintaan dari frontend Anda
app.use(cors({
    credentials: true,
    origin: 'https://desa-relokasi-pelem.my.id' // Pastikan domain ini benar
}));

// 2. Body Parsers: Ajari Express cara membaca JSON
// Middleware ini WAJIB ada SEBELUM app.use(UserRoute)
app.use(express.json()); 

// 3. Session: Atur session setelah CORS dan body parser
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: 'auto',
    }
}));

// (Opsional: Sinkronisasi tabel session)
// await store.sync();

// === ROUTING ===
// Daftarkan route Anda SETELAH semua middleware di atas
app.use(UserRoute);
app.use(BeritaRoutes);
app.use(TokohRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
