const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  header: String,
  fileName: String,
  fileType: String,
  filePath: String,
  fileURL: String,
});

module.exports = mongoose.model("Document", DocumentSchema);
