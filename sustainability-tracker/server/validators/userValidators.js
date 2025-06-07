import Joi from 'joi';

const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),

  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),

  city: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'City cannot exceed 100 characters',
    }),

  state: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'State cannot exceed 100 characters',
    }),

  company: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Company name cannot exceed 200 characters',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

const profilePictureSchema = Joi.object({
  profilePicture: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Profile picture must be a valid URL',
      'any.required': 'Profile picture URL is required',
    }),
});

const updateUserProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
    }),

  city: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'City cannot exceed 100 characters',
    }),

  state: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'State cannot exceed 100 characters',
    }),

  company: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Company name cannot exceed 200 characters',
    }),

  profilePicture: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),
});

export const validateRegister = (input) => {
  return registerSchema.validate(input, { abortEarly: false });
};

export const validateLogin = (input) => {
  return loginSchema.validate(input, { abortEarly: false });
};

export const validateProfilePicture = (input) => {
  return profilePictureSchema.validate(input, { abortEarly: false });
};

export const validateUpdateUserProfile = (input) => {
  return updateUserProfileSchema.validate(input, { abortEarly: false });
};