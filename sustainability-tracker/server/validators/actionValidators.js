import Joi from 'joi';

// Enum of valid action types
const actionTypes = [
  'REUSABLE_BOTTLE',
  'PUBLIC_TRANSPORT',
  'COMPOSTING',
  'RECYCLING',
  'DIGITAL_OVER_PRINT',
  'RIDESHARE',
  'ENERGY_SAVING',
  'WATER_CONSERVATION',
  'WASTE_REDUCTION',
  'OTHER',
];

// Schema for creating a new sustainability action
const createActionSchema = Joi.object({
  actionType: Joi.string()
    .valid(...actionTypes)
    .required()
    .messages({
      'any.required': 'Action type is required',
      'any.only': 'Action type must be one of the allowed values',
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  
  impactScore: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Impact score must be a number',
      'number.min': 'Impact score must be at least 0',
    }),
  
  performedAt: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Performed date must be a valid ISO date string',
    }),
  // userId removed from validation schema
});

// Schema for updating an existing sustainability action
const updateActionSchema = Joi.object({
  actionType: Joi.string()
    .valid(...actionTypes)
    .optional()
    .messages({
      'any.only': 'Action type must be one of the allowed values',
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  
  impactScore: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Impact score must be a number',
      'number.min': 'Impact score must be at least 0',
    }),
  
  performedAt: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Performed date must be a valid ISO date string',
    }),
});

// Function to validate creating a sustainability action
export const validateCreateAction = (action) => {
  return createActionSchema.validate(action, { abortEarly: false });
};

// Function to validate updating a sustainability action
export const validateUpdateAction = (action) => {
  return updateActionSchema.validate(action, { abortEarly: false });
};

// Get default impact score based on action type
export const getDefaultImpactScore = (actionType) => {
  const impactScores = {
    'REUSABLE_BOTTLE': 5,
    'PUBLIC_TRANSPORT': 8,
    'COMPOSTING': 7,
    'RECYCLING': 6,
    'DIGITAL_OVER_PRINT': 4,
    'RIDESHARE': 3,
    'ENERGY_SAVING': 7,
    'WATER_CONSERVATION': 7,
    'WASTE_REDUCTION': 6,
    'OTHER': 2,
  };
  
  return impactScores[actionType] || 1;
};