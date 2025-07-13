const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  console.log('=== VALIDATION DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  // Handle different types of validation schemas
  let validationData = {};
  let validationSchema = schema;

  // If schema is an object with body, params, query properties
  if (schema.body || schema.params || schema.query) {
    validationData = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    // Create a combined schema for all parts
    const schemaParts = {};
    if (schema.body) schemaParts.body = schema.body;
    if (schema.params) schemaParts.params = schema.params;
    if (schema.query) schemaParts.query = schema.query;

    validationSchema = Joi.object(schemaParts);
  } else {
    // Direct schema validation (for backward compatibility)
    validationData = req.body;
  }

  const { error, value } = validationSchema.validate(validationData, validationOptions);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessage,
      code: 'VALIDATION_ERROR',
      statusCode: 400
    });
  }

  // Update request object with validated data
  if (schema.body || schema.params || schema.query) {
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;
  } else {
    req.body = value;
  }

  next();
};

// Common validation schemas
const schemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  id: Joi.object({
    id: Joi.string().required(),
  }),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    }),
};

module.exports = {
  validate,
  schemas,
};
