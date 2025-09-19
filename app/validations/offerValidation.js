const Joi = require("joi");

const createOfferSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Offer name is required",
      "string.min": "Offer name should be at least 3 characters long",
      "any.required": "Offer name is required"
    }),

  value_props: Joi.array()
    .items(
      Joi.string().trim().min(3).max(200).messages({
        "string.min": "Each value prop must be at least 3 characters long"
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one value prop is required",
      "any.required": "Value props are required"
    }),

  ideal_use_cases: Joi.array()
    .items(
      Joi.string().trim().min(3).max(200).messages({
        "string.min": "Each use case must be at least 3 characters long"
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one ideal use case is required",
      "any.required": "Ideal use cases are required"
    })
});

module.exports = { createOfferSchema };
