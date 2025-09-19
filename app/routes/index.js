const express = require("express")
const router = express.Router();
//Import controllers

const offerRoute = require("./offerRoute");
const leadRoute = require("./leadRoute");
const scoreRoute = require("./scoreRoute");
const resultRoute = require("./resultRoute");

router.use("/offer",offerRoute);
router.use("/leads",leadRoute);
router.use("/score",scoreRoute);
router.use("/results",resultRoute);

module.exports = router;