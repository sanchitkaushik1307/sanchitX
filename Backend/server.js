import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Dynamic CORS configuration for local & production hosting
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or any allowed origins
        if (!origin || origin === "null") return callback(null, true);
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
        if (origin.includes("onrender.com") || origin.includes("localhost") || origin.includes("127.0.0.1")) return callback(null, true);
        return callback(null, true); // Fallback allow all origins
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Production Health Check Endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "SanchitX Backend", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// Serve static frontend build if dist folder exists (for single-service deployment)
const frontendDistPath = path.join(__dirname, "../Frontend/dist");
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
        return next();
    }
    const indexPath = path.join(frontendDistPath, "index.html");
    res.sendFile(indexPath, (err) => {
        if (err) {
            next();
        }
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SanchitX server running on port ${PORT}`);
    connectDB();
});

mongoose.set('bufferCommands', false);

const connectDB = async() => {
    if (!process.env.MONGODB_URI) {
        console.log("⚠️ MONGODB_URI is not defined in .env. Running without DB connection.");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 2000
        });
        console.log("Connected with Database!");
    } catch(err) {
        console.log("MongoDB connection notice:", err.message);
        console.log("💡 App will run in memory mode. Start MongoDB to persist chat history.");
    }
};
