const Joi = require('joi');

const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(1)
      .required()
      .messages({
        'string.min': 'Password cannot be empty',
        'any.required': 'Password is required',
      }),
  }),
};

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Please provide a valid email address',
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      }),
    currentPassword: Joi.string()
      .when('password', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'any.required': 'Current password is required when updating password',
      }),
  }),
};

const userIdSchema = {
  params: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'any.required': 'User ID is required',
      }),
  }),
};

const querySchema = {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
      }),
  }),
};

module.exports = {
  loginSchema,
  updateProfileSchema,
  querySchema,
  userIdSchema
};
