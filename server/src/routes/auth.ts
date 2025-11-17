import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getProfile,
  updateProfile
} from '@/controllers/authController';
import { auth } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = express.Router();

// Registration validation
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['farmer', 'buyer', 'agent'])
    .withMessage('Invalid role'),
  body('profile.location.state')
    .notEmpty()
    .withMessage('State is required'),
  body('profile.location.district')
    .notEmpty()
    .withMessage('District is required'),
  body('profile.location.village')
    .notEmpty()
    .withMessage('Village is required'),
  body('profile.location.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid pincode')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password change validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Profile update validation
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('profile.farmSize')
    .optional()
    .isNumeric()
    .withMessage('Farm size must be a number'),
  body('profile.annualIncome')
    .optional()
    .isNumeric()
    .withMessage('Annual income must be a number')
];

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  validate,
  forgotPassword
);
router.post('/reset-password/:token',
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate,
  resetPassword
);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification',
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  validate,
  resendVerification
);

// Protected routes
router.use(auth); // All routes below require authentication

router.post('/logout', logout);
router.post('/change-password', changePasswordValidation, validate, changePassword);
router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidation, validate, updateProfile);

export default router;
