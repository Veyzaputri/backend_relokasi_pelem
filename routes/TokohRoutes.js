import express from "express";
import {
    getTokoh,
    getTokohById,
    createTokoh,
    updateTokoh,
    deleteTokoh
} from "../controller/TokohController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/tokoh", getTokoh);
router.get("/tokoh/:id_tokoh",authMiddleware, getTokohById);
router.post("/add-tokoh",authMiddleware, upload.single('file'), createTokoh);
router.put("/tokoh/:id_tokoh",authMiddleware, upload.single("file"), updateTokoh);
router.delete("/tokoh/:id_tokoh",authMiddleware, deleteTokoh);

export default router;
