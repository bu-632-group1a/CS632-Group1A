import Joi from 'joi';

// Enum of valid bingo categories
const bingoCategories = [
  'TRANSPORT',
  'ENERGY',
  'WASTE',
  'WATER',
  'FOOD',
  'COMMUNITY',
  'DIGITAL',
  'GENERAL',
];

// Schema for creating a new bingo item
const createBingoItemSchema = Joi.object({
  text: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Bingo item text is required',
      'string.max': 'Bingo item text cannot exceed 200 characters',
      'string.empty': 'Bingo item text cannot be empty',
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .required()
    .messages({
      'any.required': 'Position is required',
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be at least 0',
      'number.max': 'Position must be at most 15',
    }),
  
  category: Joi.string()
    .valid(...bingoCategories)
    .optional()
    .default('GENERAL')
    .messages({
      'any.only': 'Category must be one of the allowed values',
    }),
  
  points: Joi.number()
    .min(0)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Points must be a number',
      'number.min': 'Points must be at least 0',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
});

// Schema for updating an existing bingo item
const updateBingoItemSchema = Joi.object({
  text: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Bingo item text cannot exceed 200 characters',
      'string.empty': 'Bingo item text cannot be empty',
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .optional()
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be at least 0',
      'number.max': 'Position must be at most 15',
    }),
  
  category: Joi.string()
    .valid(...bingoCategories)
    .optional()
    .messages({
      'any.only': 'Category must be one of the allowed values',
    }),
  
  points: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Points must be a number',
      'number.min': 'Points must be at least 0',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
});

// Function to validate creating a bingo item
export const validateCreateBingoItem = (item) => {
  return createBingoItemSchema.validate(item, { abortEarly: false });
};

// Function to validate updating a bingo item
export const validateUpdateBingoItem = (item) => {
  return updateBingoItemSchema.validate(item, { abortEarly: false });
};

// Get default bingo items for a new game
export const getDefaultBingoItems = () => {
  return [
    { text: 'Use a reusable water bottle', position: 0, category: 'WASTE' },
    { text: 'Take public transportation', position: 1, category: 'TRANSPORT' },
    { text: 'Compost food scraps', position: 2, category: 'WASTE' },
    { text: 'Recycle paper or plastic', position: 3, category: 'WASTE' },
    { text: 'Turn off lights when leaving', position: 4, category: 'ENERGY' },
    { text: 'Use digital receipts', position: 5, category: 'DIGITAL' },
    { text: 'Walk or bike instead of driving', position: 6, category: 'TRANSPORT' },
    { text: 'Bring reusable bags shopping', position: 7, category: 'WASTE' },
    { text: 'Take shorter showers', position: 8, category: 'WATER' },
    { text: 'Eat a plant-based meal', position: 9, category: 'FOOD' },
    { text: 'Unplug electronics when not in use', position: 10, category: 'ENERGY' },
    { text: 'Share sustainability tips', position: 11, category: 'COMMUNITY' },
    { text: 'Fix something instead of replacing', position: 12, category: 'WASTE' },
    { text: 'Use cold water for washing', position: 13, category: 'WATER' },
    { text: 'Choose local/seasonal produce', position: 14, category: 'FOOD' },
    { text: 'Participate in cleanup activity', position: 15, category: 'COMMUNITY' },
  ];
};