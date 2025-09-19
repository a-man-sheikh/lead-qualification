const express = require("express")
const router = express.Router();
//Import controllers
const {scoreLeads} = require("../controllers/leadController")


router.post("/",scoreLeads);

module.exports = router;