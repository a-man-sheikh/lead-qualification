const express = require("express")
const router = express.Router();
//Import controllers
const {getResults,exportResults} = require("../controllers/leadController")


router.get("/", getResults);
router.get("/export", exportResults);

module.exports = router;