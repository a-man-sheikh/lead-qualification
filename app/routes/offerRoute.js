const express = require("express")
const router = express.Router();
//Import controllers
const {createOffer} = require("../controllers/offerController")
const validate = require("../middlewares/validateMiddleware")
const {createOfferSchema }= require("../validations/offerValidation")


router.post("/", validate(createOfferSchema), createOffer);

module.exports = router;