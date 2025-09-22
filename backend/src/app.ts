import express from "express";
import cors from "cors";
import folderRoutes from "./routes/folders.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/auth.js";

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/folders",authMiddleware, folderRoutes);

const PORT=4000;
app.listen(PORT,()=>{
    console.log('Server running on http://localhost:${PORT}');
})