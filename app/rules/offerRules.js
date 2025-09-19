const Offer = require("../models/Offer");

// Rule to check if we can create a new offer
async function canCreateOffer() {
  const existingOffer = await Offer.findOne();
  return existingOffer ? false : true;
}

// Rule to create a new offer
async function createNewOffer(data) {
  const offer = new Offer(data);
  await offer.save();
  return offer;
}

module.exports = {
  canCreateOffer,
  createNewOffer,
};
