const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDirectory = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: function (
    req,
    file,
    cb
  ) {
    cb(null, uploadDirectory);
  },

  filename: function (
    req,
    file,
    cb
  ) {
    const safeFileName =
      file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );

    cb(
      null,
      `${Date.now()}-${safeFileName}`
    );
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    file.mimetype ===
    "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:
      20 * 1024 * 1024,
  },
});

module.exports = upload;