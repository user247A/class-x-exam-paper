const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  header: String,
  fileName: String,
  fileType: String,
  filePath: String,
  fileURL: String,
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
