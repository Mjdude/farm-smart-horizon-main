import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'farmer' | 'buyer' | 'admin' | 'agent';
  profile: {
    farmSize?: number;
    location: {
      state: string;
      district: string;
      village: string;
      pincode: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    cropTypes: string[];
    farmingExperience: number;
    annualIncome?: number;
    landOwnership: 'owned' | 'leased' | 'both';
    category: 'marginal' | 'small' | 'medium' | 'large';
    hasKCC: boolean;
    bankAccount: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      accountHolderName?: string;
    };
    documents: {
      aadhaar?: string;
      pan?: string;
      landRecords?: string[];
      kccCard?: string;
    };
  };
  preferences: {
    notifications: {
      push: boolean;
      sms: boolean;
      email: boolean;
      whatsapp: boolean;
    };
    language: string;
    currency: string;
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin', 'agent'],
    default: 'farmer'
  },
  profile: {
    farmSize: {
      type: Number,
      min: [0, 'Farm size cannot be negative']
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      village: { type: String, required: true },
      pincode: { 
        type: String, 
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
      },
      coordinates: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 }
      }
    },
    cropTypes: [{
      type: String,
      enum: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Other']
    }],
    farmingExperience: {
      type: Number,
      min: [0, 'Farming experience cannot be negative'],
      max: [100, 'Farming experience seems too high']
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative']
    },
    landOwnership: {
      type: String,
      enum: ['owned', 'leased', 'both'],
      default: 'owned'
    },
    category: {
      type: String,
      enum: ['marginal', 'small', 'medium', 'large'],
      default: 'small'
    },
    hasKCC: {
      type: Boolean,
      default: false
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    },
    documents: {
      aadhaar: String,
      pan: String,
      landRecords: [String],
      kccCard: String
    }
  },
  preferences: {
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'profile.location.state': 1, 'profile.location.district': 1 });
userSchema.index({ 'profile.cropTypes': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );
};

export default mongoose.model<IUser>('User', userSchema);
