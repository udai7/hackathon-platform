import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserModel from "../db/models/User";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = "1h";

// Helper to sign access token
const signAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register
router.post("/register", async (req: any, res: any) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await UserModel.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const id = `user-${Date.now()}`;
    const user: any = new UserModel({
      id,
      name,
      email,
      password: hashed,
      role,
    });
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken as any;
    await user.save();

    // Set httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Register error", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user: any = await UserModel.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken as any;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Refresh access token
router.post("/refresh", async (req: any, res: any) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Missing refresh token" });

    const user: any = await UserModel.findOne({ refreshToken });
    if (!user)
      return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = signAccessToken(user);
    // Optionally rotate refresh token
    const newRefresh = uuidv4();
    user.refreshToken = newRefresh as any;
    await user.save();
    res.cookie("refreshToken", newRefresh, { httpOnly: true, sameSite: "lax" });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Refresh error", error);
    res.status(500).json({ message: "Refresh failed" });
  }
});

// Logout
router.post("/logout", async (req: any, res: any) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const user: any = await UserModel.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined as any;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

export default router;
