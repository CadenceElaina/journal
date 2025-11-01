const { body, validationResult } = require("express-validator");

// Username validation: 3-20 chars, alphanumeric + underscore/hyphen
const usernameValidation = () => {
  return body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters long")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    );
};

// Email validation: standard format + lowercase
const emailValidation = () => {
  return body("email")
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(); // Converts to lowercase
};

// Name validation: letters, hyphens, apostrophes, spaces, unicode (for international names), no numbers
const nameValidation = (fieldName) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isLength({ max: 50 })
    .withMessage(`${fieldName} must be less than 50 characters`)
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage(
      `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    );
};

// Registration validation rules
const registrationValidationRules = () => {
  return [
    nameValidation("firstName"),
    nameValidation("lastName"),
    usernameValidation(),
    emailValidation(),
    body("role")
      .isIn(["provider", "nonProvider"])
      .withMessage("Role must either be 'provider' or 'nonProivder'"),
  ];
};

// Middleware to check validation results
const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return response.status(400).json({ errors: errorMessages });
  }
  next();
};

module.exports = {
  registrationValidationRules,
  usernameValidation,
  emailValidation,
  nameValidation,
  validate,
};
