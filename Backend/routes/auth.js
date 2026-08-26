import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import JWT_SECRET, { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback users store when DB is offline
const memoryUsers = new Map();

// Initial demo user
const demoPasswordHash = await bcrypt.hash("demo1234", 10);
memoryUsers.set("sanchit@sanchitx.ai", {
    id: "user_demo_1",
    name: "Sanchit Kaushik",
    email: "sanchit@sanchitx.ai",
    password: demoPasswordHash
});

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
        if (isDbConnected()) {
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                return res.status(400).json({ error: "An account with this email already exists." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                name: name.trim(),
                email: cleanEmail,
                password: hashedPassword
            });

            await newUser.save();

            const token = jwt.sign(
                { userId: newUser._id.toString(), email: newUser.email, name: newUser.name },
                JWT_SECRET,
                { expiresIn: "30d" }
            );

            return res.status(201).json({
                token,
                user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name }
            });
        } else {
            // Memory fallback
            if (memoryUsers.has(cleanEmail)) {
                return res.status(400).json({ error: "An account with this email already exists." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = "user_" + Date.now();
            const userObj = { id: userId, name: name.trim(), email: cleanEmail, password: hashedPassword };
            memoryUsers.set(cleanEmail, userObj);

            const token = jwt.sign(
                { userId: userObj.id, email: userObj.email, name: userObj.name },
                JWT_SECRET,
                { expiresIn: "30d" }
            );

            return res.status(201).json({
                token,
                user: { id: userObj.id, email: userObj.email, name: userObj.name }
            });
        }
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ error: "Failed to register user." });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
        if (isDbConnected()) {
            let user = await User.findOne({ email: cleanEmail });
            
            // Auto-seed demo user in database if demo account is used and not yet in DB
            if (!user && cleanEmail === "sanchit@sanchitx.ai" && password === "demo1234") {
                const hashedPassword = await bcrypt.hash("demo1234", 10);
                user = new User({
                    name: "Sanchit Kaushik",
                    email: "sanchit@sanchitx.ai",
                    password: hashedPassword
                });
                await user.save();
            }

            if (!user) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            const token = jwt.sign(
                { userId: user._id.toString(), email: user.email, name: user.name },
                JWT_SECRET,
                { expiresIn: "30d" }
            );

            return res.json({
                token,
                user: { id: user._id.toString(), email: user.email, name: user.name }
            });
        } else {
            // Memory fallback
            const userObj = memoryUsers.get(cleanEmail);
            if (!userObj) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            const isMatch = await bcrypt.compare(password, userObj.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid email or password." });
            }

            const token = jwt.sign(
                { userId: userObj.id, email: userObj.email, name: userObj.name },
                JWT_SECRET,
                { expiresIn: "30d" }
            );

            return res.json({
                token,
                user: { id: userObj.id, email: userObj.email, name: userObj.name }
            });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: "Failed to log in." });
    }
});

// Get Current User (Session verification)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        return res.json({
            user: {
                id: req.user.userId,
                email: req.user.email,
                name: req.user.name
            }
        });
    } catch (err) {
        return res.status(401).json({ error: "Invalid session." });
    }
});

export default router;
