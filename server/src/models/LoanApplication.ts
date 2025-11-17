import mongoose, { Document, Schema } from 'mongoose';

export interface ILoanApplication extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  loanType: 'crop-loan' | 'equipment' | 'livestock' | 'personal' | 'business';
  loanProduct: {
    name: string;
    provider: string;
    interestRate: number;
    maxAmount: number;
    tenure: number;
  };
  applicationId: string;
  requestedAmount: number;
  approvedAmount?: number;
  tenure: number; // in months
  purpose: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  applicantDetails: {
    name: string;
    fatherName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    education: string;
    occupation: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    address: {
      permanent: {
        street: string;
        village: string;
        district: string;
        state: string;
        pincode: string;
      };
      current: {
        street: string;
        village: string;
        district: string;
        state: string;
        pincode: string;
      };
    };
  };
  financialDetails: {
    annualIncome: number;
    monthlyIncome: number;
    existingLoans: {
      provider: string;
      amount: number;
      emi: number;
      outstandingAmount: number;
    }[];
    bankAccount: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountType: 'savings' | 'current';
      accountHolderName: string;
    };
    creditScore?: number;
    hasKCC: boolean;
    kccLimit?: number;
  };
  farmDetails?: {
    farmSize: number;
    landOwnership: 'owned' | 'leased' | 'both';
    cropTypes: string[];
    irrigationType: 'rainfed' | 'irrigated' | 'both';
    farmingExperience: number;
    expectedYield: number;
    expectedIncome: number;
  };
  collateral?: {
    type: 'land' | 'gold' | 'fd' | 'vehicle' | 'property' | 'none';
    value: number;
    description: string;
    documents: string[];
  };
  guarantor?: {
    name: string;
    relation: string;
    phone: string;
    address: string;
    income: number;
    documents: string[];
  };
  documents: {
    identityProof: string[];
    addressProof: string[];
    incomeProof: string[];
    bankStatements: string[];
    landDocuments?: string[];
    collateralDocuments?: string[];
    others: string[];
  };
  riskAssessment: {
    score: number;
    factors: {
      creditHistory: number;
      incomeStability: number;
      collateralValue: number;
      farmingExperience: number;
      marketConditions: number;
    };
    recommendation: 'approve' | 'reject' | 'review';
  };
  loanTerms?: {
    principalAmount: number;
    interestRate: number;
    processingFee: number;
    tenure: number;
    emi: number;
    totalInterest: number;
    totalAmount: number;
  };
  disbursement?: {
    method: 'bank-transfer' | 'cheque' | 'cash';
    accountDetails: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
    amount: number;
    date: Date;
    transactionId: string;
  };
  repayment: {
    schedule: {
      installmentNumber: number;
      dueDate: Date;
      principalAmount: number;
      interestAmount: number;
      totalAmount: number;
      status: 'pending' | 'paid' | 'overdue';
      paidDate?: Date;
      paidAmount?: number;
    }[];
    totalPaid: number;
    outstandingAmount: number;
    nextDueDate?: Date;
    overdueAmount: number;
  };
  timeline: {
    applied: Date;
    reviewed?: Date;
    approved?: Date;
    rejected?: Date;
    disbursed?: Date;
    closed?: Date;
  };
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loanApplicationSchema = new Schema<ILoanApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['crop-loan', 'equipment', 'livestock', 'personal', 'business'],
    required: true
  },
  loanProduct: {
    name: { type: String, required: true },
    provider: { type: String, required: true },
    interestRate: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    tenure: { type: Number, required: true }
  },
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  requestedAmount: {
    type: Number,
    required: true,
    min: [1000, 'Minimum loan amount is ₹1000']
  },
  approvedAmount: {
    type: Number,
    min: 0
  },
  tenure: {
    type: Number,
    required: true,
    min: [1, 'Minimum tenure is 1 month'],
    max: [360, 'Maximum tenure is 360 months']
  },
  purpose: {
    type: String,
    required: true,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed', 'closed'],
    default: 'draft'
  },
  applicantDetails: {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      required: true
    },
    education: { type: String, required: true },
    occupation: { type: String, required: true }
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
      permanent: {
        street: { type: String, required: true },
        village: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
      },
      current: {
        street: { type: String, required: true },
        village: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
      }
    }
  },
  financialDetails: {
    annualIncome: {
      type: Number,
      required: true,
      min: [0, 'Annual income cannot be negative']
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: [0, 'Monthly income cannot be negative']
    },
    existingLoans: [{
      provider: { type: String, required: true },
      amount: { type: Number, required: true },
      emi: { type: Number, required: true },
      outstandingAmount: { type: Number, required: true }
    }],
    bankAccount: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      accountType: {
        type: String,
        enum: ['savings', 'current'],
        required: true
      },
      accountHolderName: { type: String, required: true }
    },
    creditScore: { type: Number, min: 300, max: 900 },
    hasKCC: { type: Boolean, default: false },
    kccLimit: { type: Number, min: 0 }
  },
  farmDetails: {
    farmSize: { type: Number, min: 0 },
    landOwnership: {
      type: String,
      enum: ['owned', 'leased', 'both']
    },
    cropTypes: [String],
    irrigationType: {
      type: String,
      enum: ['rainfed', 'irrigated', 'both']
    },
    farmingExperience: { type: Number, min: 0 },
    expectedYield: { type: Number, min: 0 },
    expectedIncome: { type: Number, min: 0 }
  },
  collateral: {
    type: {
      type: String,
      enum: ['land', 'gold', 'fd', 'vehicle', 'property', 'none']
    },
    value: { type: Number, min: 0 },
    description: String,
    documents: [String]
  },
  guarantor: {
    name: String,
    relation: String,
    phone: String,
    address: String,
    income: { type: Number, min: 0 },
    documents: [String]
  },
  documents: {
    identityProof: [String],
    addressProof: [String],
    incomeProof: [String],
    bankStatements: [String],
    landDocuments: [String],
    collateralDocuments: [String],
    others: [String]
  },
  riskAssessment: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    factors: {
      creditHistory: { type: Number, min: 0, max: 100, default: 0 },
      incomeStability: { type: Number, min: 0, max: 100, default: 0 },
      collateralValue: { type: Number, min: 0, max: 100, default: 0 },
      farmingExperience: { type: Number, min: 0, max: 100, default: 0 },
      marketConditions: { type: Number, min: 0, max: 100, default: 0 }
    },
    recommendation: {
      type: String,
      enum: ['approve', 'reject', 'review'],
      default: 'review'
    }
  },
  loanTerms: {
    principalAmount: { type: Number, min: 0 },
    interestRate: { type: Number, min: 0 },
    processingFee: { type: Number, min: 0 },
    tenure: { type: Number, min: 1 },
    emi: { type: Number, min: 0 },
    totalInterest: { type: Number, min: 0 },
    totalAmount: { type: Number, min: 0 }
  },
  disbursement: {
    method: {
      type: String,
      enum: ['bank-transfer', 'cheque', 'cash']
    },
    accountDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    amount: { type: Number, min: 0 },
    date: Date,
    transactionId: String
  },
  repayment: {
    schedule: [{
      installmentNumber: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      principalAmount: { type: Number, required: true },
      interestAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      paidDate: Date,
      paidAmount: Number
    }],
    totalPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    nextDueDate: Date,
    overdueAmount: { type: Number, default: 0 }
  },
  timeline: {
    applied: { type: Date, default: Date.now },
    reviewed: Date,
    approved: Date,
    rejected: Date,
    disbursed: Date,
    closed: Date
  },
  reviewNotes: String,
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes
loanApplicationSchema.index({ userId: 1 });
loanApplicationSchema.index({ applicationId: 1 });
loanApplicationSchema.index({ status: 1 });
loanApplicationSchema.index({ loanType: 1 });
loanApplicationSchema.index({ 'contactDetails.address.permanent.state': 1 });
loanApplicationSchema.index({ createdAt: -1 });

// Generate application ID before saving
loanApplicationSchema.pre('save', function(next) {
  if (this.isNew && !this.applicationId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.applicationId = `LOAN${timestamp.slice(-6)}${random}`;
  }
  next();
});

export default mongoose.model<ILoanApplication>('LoanApplication', loanApplicationSchema);
