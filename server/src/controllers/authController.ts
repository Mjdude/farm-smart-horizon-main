import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '@/models/User';
import { sendEmail } from '@/services/emailService';
import { sendSMS } from '@/services/smsService';
import { getRedisClient } from '@/config/redis';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

interface AuthRequest extends Request {
  user?: IUser;
}

// Register new user
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, profile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    throw new AppError('User already exists with this email or phone', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'farmer',
    profile
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.setEx(`verify:${verificationToken}`, 3600, user._id.toString());
  }

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Farm Smart Horizon',
    template: 'verification',
    data: {
      name,
      verificationUrl
    }
  });

  // Send welcome SMS
  await sendSMS({
    to: phone,
    message: `Welcome to Farm Smart Horizon! Please verify your email to complete registration.`
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for verification.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

// Login user
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact support.', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in Redis
  const redisClient = getRedisClient();
  if (redisClient) {
    await redisClient.setEx(`refresh:${user._id}`, 30 * 24 * 60 * 60, refreshToken);
  }

  // Set secure cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      },
      accessToken
    }
  });
});

// Logout user
export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  // Remove refresh token from Redis
  const redisClient = getRedisClient();
  if (redisClient) {
    await redisClient.del(`refresh:${userId}`);
  }

  // Clear cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh access token
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AppError('Refresh token not provided', 401);
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as any;
  
  // Check if token exists in Redis
  const redisClient = getRedisClient();
  let storedToken = null;
  
  if (redisClient) {
    storedToken = await redisClient.get(`refresh:${decoded.id}`);
  }

  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401);
  }

  // Generate new access token
  const newAccessToken = user.generateAuthToken();

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken
    }
  });
});

// Verify email
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;

  const redisClient = getRedisClient();
  let userId = null;

  if (redisClient) {
    userId = await redisClient.get(`verify:${token}`);
  }

  if (!userId) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user verification status
  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove verification token
  if (redisClient) {
    await redisClient.del(`verify:${token}`);
  }

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Resend verification email
export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.setEx(`verify:${verificationToken}`, 3600, user._id.toString());
  }

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Farm Smart Horizon',
    template: 'verification',
    data: {
      name: user.name,
      verificationUrl
    }
  });

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
});

// Forgot password
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.setEx(`reset:${resetToken}`, 3600, user._id.toString());
  }

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset - Farm Smart Horizon',
    template: 'passwordReset',
    data: {
      name: user.name,
      resetUrl
    }
  });

  res.json({
    success: true,
    message: 'Password reset email sent successfully'
  });
});

// Reset password
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const redisClient = getRedisClient();
  let userId = null;

  if (redisClient) {
    userId = await redisClient.get(`reset:${token}`);
  }

  if (!userId) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update user password
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.password = password;
  await user.save();

  // Remove reset token
  if (redisClient) {
    await redisClient.del(`reset:${token}`);
  }

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

// Change password
export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  // Find user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Get user profile
export const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const updates = req.body;

  // Remove sensitive fields
  delete updates.password;
  delete updates.email;
  delete updates.role;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    }
  });
});
