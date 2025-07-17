import User from "../models/UserModel.js";
import bcrypt from "bcrypt";

// GET all users
async function getUsers(req, res) {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// GET user by ID
async function getUserById(req, res) {
  try {
    const response = await User.findOne({
      where: { id: req.params.id },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// REGISTER
async function createUser(req, res) {
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
async function updateUser(req, res) {
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
async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// LOGIN (tanpa token, pakai session)
async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;
    console.log("Username masuk:", username);
    console.log("Password masuk:", password);
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    console.log("Password dari client:", password);
    console.log("Password dari database:", user.password);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    req.session.userId = user.id;
    req.session.username = user.username;
    console.log("Session setelah login:", req.session);

    res.status(200).json({
      msg: "Login berhasil",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// LOGOUT
async function logout(req, res) {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: "Logout gagal" });
    res.clearCookie('connect.sid');
    res.status(200).json({ msg: "Logout berhasil" });
  });
}

// Export semua fungsi
export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginHandler,
  logout,
};
