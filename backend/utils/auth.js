import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Hash
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
