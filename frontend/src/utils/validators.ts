import * as yup from 'yup';

export const emailSchema = yup
  .string()
  .required('Email is required')
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const noteSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: yup.string().max(50000, 'Content must be less than 50,000 characters'),
  tags: yup.array().of(yup.string().max(50, 'Tag must be less than 50 characters')),
});

export const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const shareNoteSchema = yup.object({
  userEmail: emailSchema,
  permission: yup.string().oneOf(['view', 'edit']).required('Permission is required'),
});

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.validateSync(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.validateSync(password);
    return true;
  } catch {
    return false;
  }
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'error' };
  if (score <= 4) return { score, label: 'Fair', color: 'warning' };
  if (score <= 5) return { score, label: 'Good', color: 'info' };
  return { score, label: 'Strong', color: 'success' };
};
