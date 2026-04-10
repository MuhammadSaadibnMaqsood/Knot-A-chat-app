const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 1. Bcrypt functions

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hashPassword(password, salt);
};

exports.comparePassword = async (password, hashPath) => {
  return await bcrypt.compare(password, hashPath);
};

// 2. JWT function

exports.generateToken = async (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};