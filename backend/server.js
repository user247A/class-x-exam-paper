const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const Document = require("./models/document");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Static files
app.use("/uploads", express.static(uploadsDir));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Upload
app.post("/publish", upload.single("file"), async (req, res) => {
  try {
    const { header } = req.body;
    const file = req.file;
    const fileURL = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    const newDoc = new Document({
      header,
      fileName: file.originalname,
      fileType: file.mimetype,
      filePath: file.path,
      fileURL
    });

    await newDoc.save();
    res.json({ message: "✅ Document uploaded successfully!" });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Failed to upload document." });
  }
});

// View
app.get("/view", async (req, res) => {
  try {
    const docs = await Document.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents." });
  }
});

// Delete
app.delete("/delete/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);

    await doc.deleteOne();
    res.json({ message: "🗑️ Document deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete route error:", err);
    res.status(500).json({ error: "Failed to delete document." });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
