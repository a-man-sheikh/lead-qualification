const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: true });
    if (error) {
      return res.status(400).json([{
        success: false,
        message: error.details[0].message,
      }]);
    }
    next();
  };
};

module.exports = validate;