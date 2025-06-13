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
    { text: 'Use a reusable water bottle', category: 'WASTE' },
    { text: 'Take public transportation', category: 'TRANSPORT' },
    { text: 'Compost food scraps', category: 'WASTE' },
    { text: 'Recycle paper or plastic', category: 'WASTE' },
    { text: 'Turn off lights when leaving', category: 'ENERGY' },
    { text: 'Use digital receipts', category: 'DIGITAL' },
    { text: 'Walk or bike instead of driving', category: 'TRANSPORT' },
    { text: 'Bring reusable bags shopping', category: 'WASTE' },
    { text: 'Take shorter showers', category: 'WATER' },
    { text: 'Eat a plant-based meal', category: 'FOOD' },
    { text: 'Unplug electronics when not in use', category: 'ENERGY' },
    { text: 'Share sustainability tips', category: 'COMMUNITY' },
    { text: 'Fix something instead of replacing', category: 'WASTE' },
    { text: 'Use cold water for washing', category: 'WATER' },
    { text: 'Choose local/seasonal produce', category: 'FOOD' },
    { text: 'Participate in cleanup activity', category: 'COMMUNITY' },
  ];
};