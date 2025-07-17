import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginHandler,
  logout
} from "../controller/UserController.js";

import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Auth
router.post('/login', loginHandler);
router.delete('/logout', logout);

// CRUD (dengan proteksi login)
router.post("/register", createUser);
router.get("/users", authMiddleware, getUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/edit-user/:id", authMiddleware, updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);

export default router;
