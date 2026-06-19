const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  uploadPDF,
  askQuestion,
} = require("../controllers/pdfController");

router.post(
  "/upload",
  upload.single("pdf"),
  uploadPDF
);

router.post("/ask", askQuestion);

module.exports = router;