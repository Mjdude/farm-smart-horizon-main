import mongoose, { Document, Schema } from 'mongoose';

export interface ISchemeApplication extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  schemeId: mongoose.Types.ObjectId;
  applicationId: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'disbursed';
  personalDetails: {
    name: string;
    fatherName?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    category?: 'general' | 'obc' | 'sc' | 'st';
    aadhaarNumber?: string;
    panNumber?: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    address: {
      street: string;
      village: string;
      district: string;
      state: string;
      pincode: string;
    };
  };
  farmDetails: {
    farmSize: number;
    landOwnership: 'owned' | 'leased' | 'both';
    cropTypes: string[];
    irrigationType?: 'rainfed' | 'irrigated' | 'both';
    soilType?: string;
    farmingExperience: number;
  };
  financialDetails: {
    annualIncome?: number;
    bankAccount: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    };
    hasKCC?: boolean;
    kccLimit?: number;
  };
  documents: {
    aadhaarCard?: string;
    panCard?: string;
    landRecords?: string[];
    bankPassbook?: string;
    incomeProof?: string;
    categoryProof?: string;
    passport?: string;
    others?: string[];
  };
  applicationData: any; // Scheme-specific data
  matchScore: number;
  eligibilityCheck: {
    passed: boolean;
    criteria: {
      name: string;
      status: boolean;
      message?: string;
    }[];
  };
  reviewNotes?: string;
  rejectionReason?: string;
  approvedAmount?: number;
  disbursementDetails?: {
    amount: number;
    date: Date;
    transactionId: string;
    method: 'bank-transfer' | 'cheque' | 'cash';
  };
  timeline: {
    submitted?: Date;
    reviewed?: Date;
    approved?: Date;
    rejected?: Date;
    disbursed?: Date;
  };
  notifications: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schemeApplicationSchema = new Schema<ISchemeApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schemeId: {
    type: Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed'],
    default: 'draft'
  },
  personalDetails: {
    name: { type: String, required: true },
    fatherName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    category: {
      type: String,
      enum: ['general', 'obc', 'sc', 'st']
    },
    aadhaarNumber: {
      type: String,
      match: [/^\d{12}$/, 'Please provide a valid Aadhaar number']
    },
    panNumber: {
      type: String,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please provide a valid PAN number']
    }
  },
  contactDetails: {
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    address: {
      street: { type: String, required: true },
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Please provide a valid pincode']
      }
    }
  },
  farmDetails: {
    farmSize: {
      type: Number,
      required: true,
      min: [0, 'Farm size cannot be negative']
    },
    landOwnership: {
      type: String,
      enum: ['owned', 'leased', 'both'],
      required: true
    },
    cropTypes: [{
      type: String,
      required: true
    }],
    irrigationType: {
      type: String,
      enum: ['rainfed', 'irrigated', 'both']
    },
    soilType: String,
    farmingExperience: {
      type: Number,
      required: true,
      min: [0, 'Farming experience cannot be negative']
    }
  },
  financialDetails: {
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative']
    },
    bankAccount: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      accountHolderName: { type: String, required: true }
    },
    hasKCC: { type: Boolean, default: false },
    kccLimit: { type: Number, min: 0 }
  },
  documents: {
    aadhaarCard: String,
    panCard: String,
    landRecords: [String],
    bankPassbook: String,
    incomeProof: String,
    categoryProof: String,
    passport: String,
    others: [String]
  },
  applicationData: Schema.Types.Mixed,
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  eligibilityCheck: {
    passed: { type: Boolean, default: false },
    criteria: [{
      name: { type: String, required: true },
      status: { type: Boolean, required: true },
      message: String
    }]
  },
  reviewNotes: String,
  rejectionReason: String,
  approvedAmount: {
    type: Number,
    min: 0
  },
  disbursementDetails: {
    amount: { type: Number, min: 0 },
    date: Date,
    transactionId: String,
    method: {
      type: String,
      enum: ['bank-transfer', 'cheque', 'cash']
    }
  },
  timeline: {
    submitted: Date,
    reviewed: Date,
    approved: Date,
    rejected: Date,
    disbursed: Date
  },
  notifications: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes
schemeApplicationSchema.index({ userId: 1 });
schemeApplicationSchema.index({ schemeId: 1 });
schemeApplicationSchema.index({ applicationId: 1 });
schemeApplicationSchema.index({ status: 1 });
schemeApplicationSchema.index({ 'contactDetails.address.state': 1 });
schemeApplicationSchema.index({ 'contactDetails.address.district': 1 });
schemeApplicationSchema.index({ createdAt: -1 });

// Generate application ID before saving
schemeApplicationSchema.pre('save', function(next: () => void) {
  if (this.isNew && !this.applicationId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.applicationId = `FSH${timestamp.slice(-6)}${random}`;
  }
  next();
});

export default mongoose.model<ISchemeApplication>('SchemeApplication', schemeApplicationSchema);
