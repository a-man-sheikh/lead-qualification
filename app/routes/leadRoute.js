const express = require("express")
const router = express.Router();
//Import controllers
const {uploadLeads} = require("../controllers/leadController")
const uploadCSV = require("../middlewares/multerMiddleware")


router.post("/upload", uploadCSV.single("file"),uploadLeads);

module.exports = router;