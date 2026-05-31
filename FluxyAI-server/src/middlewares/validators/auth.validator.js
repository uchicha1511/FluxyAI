import Joi from "joi";
import { AppError } from "../../utils/errors.js";

const registerSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .messages({
      "any.required": "Username is required",
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must be at most 30 characters long",
      "string.pattern.base":
        "Username must contain only letters, numbers, and underscores",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "A valid email address is required",
    "any.required": "Email is required",
    "string.empty": "Email is required",
  }),

  password: Joi.string()
    .required()
    .min(8)
    .max(24)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email address is required",
    "any.required": "Email is required",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});


const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return next(
      new AppError(
        error.details.map((d) => d.message).join(", "),
        400,
        error.details,
      ),
    );
  }

  next();
};

export const registerValidator = validate(registerSchema);
export const loginValidator = validate(loginSchema);