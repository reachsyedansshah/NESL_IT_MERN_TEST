const Joi = require('joi');

const createPostSchema = {
  body: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Post content cannot be empty',
        'string.min': 'Post content must be at least 1 character long',
        'string.max': 'Post content cannot exceed 1000 characters',
        'any.required': 'Post content is required',
      }),
  }),
};

const updatePostSchema = {
  body: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .messages({
        'string.empty': 'Post content cannot be empty',
        'string.min': 'Post content must be at least 1 character long',
        'string.max': 'Post content cannot exceed 1000 characters',
      }),
  }),
};

const postIdSchema = {
  params: Joi.object({
    id: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .messages({
        'any.required': 'Post ID is required',
        'string.pattern.base': 'Post ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.',
      }),
  }),
};

const userIdSchema = {
  params: Joi.object({
    userId: Joi.string()
      .optional()
      .messages({
        'string.base': 'User ID must be a string',
      }),
  }),
};

const feedQuerySchema = {
  query: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50',
      }),
  }),
};

module.exports = {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  userIdSchema,
  feedQuerySchema,
};
