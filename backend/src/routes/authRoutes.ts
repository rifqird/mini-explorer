import { Router } from "express";
import type { Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hashed]);

  res.json({ message: "User registered successfully" });
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
            .status(400)
            .json({ message: "Username and password required" });
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
            username,
        ]);
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            "secret123", 
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;