const { body, validationResult } = require("express-validator");
const zxcvbn = require("zxcvbn");

const passwordValidationRules = () => {
  return [
    body("password")
      .if(body("password").exists()) // Only validate if this field exists
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .isLength({ max: 128 })
      .withMessage("Password must be less than 128 characters") // 128 max characters to prevent excessive hasing / crashing of server
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character")
      .custom((value) => {
        // Check for common patterns
        const result = zxcvbn(value);
        if (result.score < 3) {
          throw new Error(
            "Password is too weak. Avoid common words and patterns."
          );
        }
        return true;
      })
      .trim(),

    // Validate 'newPassword' field (for password reset)
    body("newPassword")
      .if(body("newPassword").exists())
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .isLength({ max: 128 })
      .withMessage("Password must be less than 128 characters")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character")
      .custom((value) => {
        const result = zxcvbn(value);
        if (result.score < 3) {
          throw new Error(
            "Password is too weak. Avoid common words and patterns."
          );
        }
        return true;
      })
      .trim(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ];
};

// Middleware to check validation results
const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = { passwordValidationRules, validate };
