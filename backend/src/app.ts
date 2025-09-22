import express from "express";
import cors from "cors";
import folderRoutes from "./routes/folders.js";

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/folders", folderRoutes);

const PORT=4000;
app.listen(PORT,()=>{
    console.log('Server running on http://localhost:${PORT}');
})