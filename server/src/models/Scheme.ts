import mongoose, { Document, Schema } from 'mongoose';

export interface IScheme extends Document {
  _id: string;
  name: string;
  description: string;
  category: 'income-support' | 'insurance' | 'credit' | 'agricultural-support' | 'sustainability';
  provider: string;
  eligibility: {
    criteria: string[];
    farmSize?: {
      min?: number;
      max?: number;
    };
    annualIncome?: {
      min?: number;
      max?: number;
    };
    category?: ('marginal' | 'small' | 'medium' | 'large')[];
    crops?: string[];
    states?: string[];
    age?: {
      min?: number;
      max?: number;
    };
  };
  benefits: {
    type: 'monetary' | 'subsidy' | 'insurance' | 'credit' | 'services';
    amount?: number;
    percentage?: number;
    description: string;
    duration?: string;
  };
  applicationProcess: {
    documents: string[];
    steps: string[];
    processingTime: string;
    applicationUrl?: string;
  };
  timeline: {
    applicationStart?: Date;
    applicationEnd?: Date;
    disbursementStart?: Date;
    disbursementEnd?: Date;
  };
  isActive: boolean;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const schemeSchema = new Schema<IScheme>({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
    maxlength: [200, 'Scheme name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Scheme description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['income-support', 'insurance', 'credit', 'agricultural-support', 'sustainability'],
    required: true
  },
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    trim: true
  },
  eligibility: {
    criteria: [{
      type: String,
      required: true
    }],
    farmSize: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    annualIncome: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    category: [{
      type: String,
      enum: ['marginal', 'small', 'medium', 'large']
    }],
    crops: [String],
    states: [String],
    age: {
      min: { type: Number, min: 0, max: 100 },
      max: { type: Number, min: 0, max: 100 }
    }
  },
  benefits: {
    type: {
      type: String,
      enum: ['monetary', 'subsidy', 'insurance', 'credit', 'services'],
      required: true
    },
    amount: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Benefits description cannot exceed 1000 characters']
    },
    duration: String
  },
  applicationProcess: {
    documents: [{
      type: String,
      required: true
    }],
    steps: [{
      type: String,
      required: true
    }],
    processingTime: {
      type: String,
      required: true
    },
    applicationUrl: String
  },
  timeline: {
    applicationStart: Date,
    applicationEnd: Date,
    disbursementStart: Date,
    disbursementEnd: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
schemeSchema.index({ category: 1 });
schemeSchema.index({ provider: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ 'eligibility.states': 1 });
schemeSchema.index({ 'eligibility.crops': 1 });
schemeSchema.index({ tags: 1 });

export default mongoose.model<IScheme>('Scheme', schemeSchema);
