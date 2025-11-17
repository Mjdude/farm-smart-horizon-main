import mongoose, { Document, Schema } from 'mongoose';

export interface ICropListing extends Document {
  _id: string;
  farmerId: mongoose.Types.ObjectId;
  cropType: string;
  variety: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton';
  pricePerUnit: number;
  totalValue: number;
  quality: 'Premium' | 'Grade A' | 'Grade B' | 'Standard';
  organic: boolean;
  harvestDate: Date;
  availableFrom: Date;
  availableUntil: Date;
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
  description: string;
  images: string[];
  specifications: {
    moisture?: number;
    purity?: number;
    grainLength?: number;
    proteinContent?: number;
    oilContent?: number;
    others?: { [key: string]: any };
  };
  packaging: {
    type: string;
    weight: number;
    minOrder: number;
  };
  pricing: {
    basePrice: number;
    negotiable: boolean;
    bulkDiscount?: {
      quantity: number;
      discount: number;
    }[];
  };
  logistics: {
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    deliveryRadius?: number;
    transportCost?: number;
  };
  certifications: string[];
  status: 'active' | 'sold' | 'expired' | 'draft';
  views: number;
  inquiries: number;
  tags: string[];
  isPromoted: boolean;
  promotionExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cropListingSchema = new Schema<ICropListing>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Other']
  },
  variety: {
    type: String,
    required: [true, 'Crop variety is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0.01, 'Price must be greater than 0']
  },
  totalValue: {
    type: Number,
    required: true
  },
  quality: {
    type: String,
    enum: ['Premium', 'Grade A', 'Grade B', 'Standard'],
    required: true
  },
  organic: {
    type: Boolean,
    default: false
  },
  harvestDate: {
    type: Date,
    required: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    required: true
  },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, 'Please provide a valid pincode']
    },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  specifications: {
    moisture: { type: Number, min: 0, max: 100 },
    purity: { type: Number, min: 0, max: 100 },
    grainLength: { type: Number, min: 0 },
    proteinContent: { type: Number, min: 0, max: 100 },
    oilContent: { type: Number, min: 0, max: 100 },
    others: Schema.Types.Mixed
  },
  packaging: {
    type: { type: String, default: 'Jute Bag' },
    weight: { type: Number, default: 50 },
    minOrder: { type: Number, default: 1, min: 1 }
  },
  pricing: {
    basePrice: { type: Number, required: true },
    negotiable: { type: Boolean, default: true },
    bulkDiscount: [{
      quantity: { type: Number, required: true },
      discount: { type: Number, required: true, min: 0, max: 100 }
    }]
  },
  logistics: {
    pickupAvailable: { type: Boolean, default: true },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryRadius: { type: Number, min: 0 },
    transportCost: { type: Number, min: 0 }
  },
  certifications: [String],
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'draft'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  tags: [String],
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionExpiry: Date
}, {
  timestamps: true
});

// Indexes
cropListingSchema.index({ farmerId: 1 });
cropListingSchema.index({ cropType: 1 });
cropListingSchema.index({ status: 1 });
cropListingSchema.index({ 'location.state': 1, 'location.district': 1 });
cropListingSchema.index({ pricePerUnit: 1 });
cropListingSchema.index({ quality: 1 });
cropListingSchema.index({ organic: 1 });
cropListingSchema.index({ availableUntil: 1 });
cropListingSchema.index({ isPromoted: -1, createdAt: -1 });
cropListingSchema.index({ tags: 1 });

// Calculate total value before saving
cropListingSchema.pre('save', function(next) {
  this.totalValue = this.quantity * this.pricePerUnit;
  next();
});

// Auto-expire listings
cropListingSchema.pre('save', function(next) {
  if (this.availableUntil < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

export default mongoose.model<ICropListing>('CropListing', cropListingSchema);
