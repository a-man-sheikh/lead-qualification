const express = require("express")
const router = express.Router();
//Import controllers

const offerRoute = require("./offerRoute")


router.use("/offer",offerRoute);

module.exports = router;