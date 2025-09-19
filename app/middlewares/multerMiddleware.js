const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/temp/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "leads-" + uniqueSuffix + ".csv");
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    path.extname(file.originalname).toLowerCase() === ".csv"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

const uploadCSV = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = uploadCSV;
