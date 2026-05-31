import Joi from "joi";
import { AppError } from "../../utils/appError.js";

const registerSchema = Joi.object({
  firstName: Joi.string().required(),

  lastName: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const registerValidator = validate(registerSchema);
