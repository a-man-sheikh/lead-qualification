const express = require("express")
const router = express.Router();
//Import controllers

const offerRoute = require("./offerRoute")
const leadRoute = require("./leadRoute")

router.use("/offer",offerRoute);
router.use("/leads",leadRoute);

module.exports = router;