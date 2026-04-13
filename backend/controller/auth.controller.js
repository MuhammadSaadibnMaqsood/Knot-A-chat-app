import User from "../model/User.js";
import { generateToken, hashPassword, comparePassword } from "../utils/auth.js";
import { checkEmail, checkPassword } from "../utils/helper.js";

// SIGN UP
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All credentials are required" });
    }

    if (!checkEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!checkPassword(password)) {
      return res.status(400).json({ message: "Weak password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: username,
      email,
      password: hashedPassword,
    });

    // ✅ Generate token
    const token = generateToken(newUser._id);

    // auth.controller.js — wherever you do res.cookie(...)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ required for HTTPS (production)
      sameSite: "none", // ✅ required for cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: newUser, message: "User created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json({ user, message: "Login successful" });
};

//LOGOUT
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};
