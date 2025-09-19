const { canCreateOffer, createNewOffer } = require("../rules/offerRules");

const createOffer = async (req, res) => {
  try {
    const { name, value_props, ideal_use_cases } = req.body;

    const allowed = await canCreateOffer();
    if (!allowed) {
      return res.status(400).json({
        success: false,
        message: "An offer already exists. Please update the existing offer.",
      });
    }

    const offer = await createNewOffer({ name, value_props, ideal_use_cases });
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });

  } catch (error) {
    console.error("Error creating offer: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { createOffer };
