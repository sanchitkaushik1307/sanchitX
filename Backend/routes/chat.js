import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import getGroqResponse from "../utils/groq.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback for threads per user when MongoDB is offline
const memoryThreads = new Map();

// Helper to sanitize title
const createTitle = (msg) => {
    if (!msg) return "New Chat";
    const clean = msg.trim().replace(/^[^\w]+/, '');
    return clean.length > 28 ? clean.substring(0, 28) + "..." : clean || "New Chat";
};

// GET Available Models for Dropdown
router.get("/models", (req, res) => {
    const activeModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const availableModels = [
        { id: "openai/gpt-oss-120b", name: "GPT OSS 120B (Groq Fast)", isDefault: activeModel === "openai/gpt-oss-120b" },
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)", isDefault: activeModel === "llama-3.3-70b-versatile" },
        { id: "groq/compound", name: "Groq Compound Beta", isDefault: activeModel === "groq/compound" },
        { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", isDefault: activeModel === "qwen/qwen3.8-27b" }
    ];

    res.json({ activeModel, models: availableModels });
});

// GET all threads for authenticated user
router.get("/thread", authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    if (isDbConnected()) {
        try {
            const threads = await Thread.find({ userId }).sort({ updatedAt: -1 });
            return res.json(threads);
        } catch (err) {
            console.error("DB error fetching threads:", err.message);
            return res.json([]);
        }
    } else {
        // Memory fallback
        const userThreads = memoryThreads.get(userId) || [];
        return res.json(userThreads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    }
});

// GET thread by ID for authenticated user
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId;

    if (isDbConnected()) {
        try {
            const thread = await Thread.findOne({ threadId, userId });
            if (!thread) {
                return res.status(404).json({ error: "Thread not found or access denied." });
            }
            return res.json(thread.messages);
        } catch (err) {
            console.error("DB error fetching thread:", err.message);
            return res.status(500).json({ error: "Failed to fetch thread messages." });
        }
    } else {
        // Memory fallback
        const userThreads = memoryThreads.get(userId) || [];
        const thread = userThreads.find(t => t.threadId === threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found or access denied." });
        }
        return res.json(thread.messages || []);
    }
});

// RENAME thread
router.patch("/thread/:threadId/rename", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required." });
    }

    const cleanTitle = title.trim();

    if (isDbConnected()) {
        try {
            const thread = await Thread.findOneAndUpdate(
                { threadId, userId },
                { title: cleanTitle, updatedAt: new Date() },
                { new: true }
            );

            if (!thread) {
                return res.status(404).json({ error: "Thread not found or access denied." });
            }

            return res.json({ success: true, thread });
        } catch (err) {
            console.error("DB error renaming thread:", err.message);
            return res.status(500).json({ error: "Failed to rename thread." });
        }
    } else {
        // Memory fallback
        const userThreads = memoryThreads.get(userId) || [];
        const thread = userThreads.find(t => t.threadId === threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found or access denied." });
        }
        thread.title = cleanTitle;
        thread.updatedAt = new Date();
        return res.json({ success: true, thread });
    }
});

// DELETE thread
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId;

    if (isDbConnected()) {
        try {
            const deletedThread = await Thread.findOneAndDelete({ threadId, userId });
            if (!deletedThread) {
                return res.status(404).json({ error: "Thread not found or access denied." });
            }
            return res.json({ success: "Thread deleted successfully" });
        } catch (err) {
            console.error("DB error deleting thread:", err.message);
            return res.status(500).json({ error: "Failed to delete thread." });
        }
    } else {
        // Memory fallback
        let userThreads = memoryThreads.get(userId) || [];
        userThreads = userThreads.filter(t => t.threadId !== threadId);
        memoryThreads.set(userId, userThreads);
        return res.json({ success: "Thread deleted successfully" });
    }
});

// POST Chat message
router.post("/chat", authMiddleware, async (req, res) => {
    const { threadId, message, model } = req.body;
    const userId = req.user.userId;

    if (!threadId || !message || !message.trim()) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const userMessageText = message.trim();

    try {
        // Generate AI response from Groq
        const assistantReply = await getGroqResponse(userMessageText, model);

        // Save to DB if connected
        if (isDbConnected()) {
            try {
                let thread = await Thread.findOne({ threadId, userId });

                if (!thread) {
                    thread = new Thread({
                        userId,
                        threadId,
                        title: createTitle(userMessageText),
                        messages: [
                            { role: "user", content: userMessageText },
                            { role: "assistant", content: assistantReply }
                        ]
                    });
                } else {
                    thread.messages.push({ role: "user", content: userMessageText });
                    thread.messages.push({ role: "assistant", content: assistantReply });
                    thread.updatedAt = new Date();
                }

                await thread.save();
            } catch (dbErr) {
                console.error("DB Save notice:", dbErr.message);
            }
        } else {
            // Memory fallback
            let userThreads = memoryThreads.get(userId) || [];
            let thread = userThreads.find(t => t.threadId === threadId);

            if (!thread) {
                thread = {
                    userId,
                    threadId,
                    title: createTitle(userMessageText),
                    messages: [
                        { role: "user", content: userMessageText },
                        { role: "assistant", content: assistantReply }
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                userThreads.push(thread);
            } else {
                thread.messages.push({ role: "user", content: userMessageText });
                thread.messages.push({ role: "assistant", content: assistantReply });
                thread.updatedAt = new Date();
            }

            memoryThreads.set(userId, userThreads);
        }

        return res.json({ reply: assistantReply });
    } catch (err) {
        console.error("Chat route error:", err);
        return res.status(500).json({ error: "Something went wrong processing your request." });
    }
});

export default router;