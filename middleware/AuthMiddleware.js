export function authMiddleware(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Belum login" });
  }
  next();
}
