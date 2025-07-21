import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// GET all users
export async function getUsers(req, res) {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// GET user by ID
export async function getUserById(req, res) {
  try {
    const response = await User.findOne({ where: { id: req.params.id } });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// REGISTER
export async function createUser(req, res) {
  try {
    const { username, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 5);
    await User.create({ username, password: hashPassword });
    res.status(201).json({ msg: "Register berhasil" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ msg: "Username sudah digunakan" });
    }
    res.status(500).json({ msg: error.message });
  }
}

// UPDATE
export async function updateUser(req, res) {
  try {
    const { username, password } = req.body;
    let updatedData = { username };

    if (password) {
      const encryptPassword = await bcrypt.hash(password, 5);
      updatedData.password = encryptPassword;
    }

    const result = await User.update(updatedData, {
      where: { id: req.params.id },
    });

    if (result[0] === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan atau tidak ada perubahan" });
    }

    res.status(200).json({ msg: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// DELETE
export async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// LOGIN menggunakan JWT
export async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ msg: "Login berhasil" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// LOGOUT
export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });
  return res.status(200).json({ msg: "Logout berhasil" });
}
