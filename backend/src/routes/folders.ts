import { Router } from "express";
import pool from "../db.js";
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder untuk menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


const router = Router();

router.get("/", async (req, res)=>{
    try{
        const [rows] = await pool.query("SELECT id, parent_id, name FROM folders order by id ASC");
        res.json(rows);
    }catch(err){
        res.status(500).json({error: "Failed to fetch folders"});
    }
});
router.post("/folders", async (req, res) => {
  const { name, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: "Folder name required" });

  try {
    const [result]: any = await pool.query(
      "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
      [name, parent_id || null]
    );
    res.json({ id: result.insertId, name, parent_id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create folder" });
  }
});
router.delete("/folders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [children]: any = await pool.query("SELECT id FROM folders WHERE parent_id = ?", [id]);
    if (children.length > 0) {
      return res.status(400).json({ error: "Folder has subfolders. Delete them first." });
    }

    await pool.query("DELETE FROM folders WHERE id = ?", [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});
router.put("/folders/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Folder name is required" });
  }

  try {
    await pool.query("UPDATE folders SET name = ? WHERE id = ?", [name, id]);
    res.json({ success: true, id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rename folder" });
  }
});
router.get("/:id/children", async(req,res)=>{
    const { id } = req.params;
    try{
        const [rows] = await pool.query(
            "SELECT id, parent_id, name FROM folders WHERE parent_id = ? ORDER BY id ASC",
            [id]
        );
        res.json(rows);
    }catch(err){
        res.status(500).json({ error: "Failed to fetch children"});
    }
});
router.post(
  "/folders/:id/upload",
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Simpan metadata file ke DB (opsional)
      await pool.query(
        "INSERT INTO files (name, path, folder_id) VALUES (?, ?, ?)",
        [req.file.originalname, req.file.filename, id]
      );

      res.json({
        success: true,
        file: {
          name: req.file.originalname,
          path: req.file.filename,
          folder_id: id,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save file" });
    }
  }
);
router.get("/folders/:id/files", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM files WHERE folder_id = ?", [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});
export default router;