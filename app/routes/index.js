const express = require("express")
const router = express.Router();
//Import controllers

const offerRoute = require("./offerRoute");
const leadRoute = require("./leadRoute");
const scoreRoute = require("./scoreRoute");

router.use("/offer",offerRoute);
router.use("/leads",leadRoute);
router.use("/score",scoreRoute);

module.exports = router;