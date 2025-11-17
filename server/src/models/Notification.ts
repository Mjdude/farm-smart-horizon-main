import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId?: mongoose.Types.ObjectId;
  type: 'weather' | 'market' | 'pest' | 'irrigation' | 'scheme' | 'loan' | 'trading' | 'general' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: Record<string, unknown>; // Additional data for the notification
  channels: ('push' | 'sms' | 'email' | 'whatsapp' | 'in-app')[];
  targetAudience: {
    userIds?: mongoose.Types.ObjectId[];
    roles?: ('farmer' | 'buyer' | 'admin' | 'agent')[];
    locations?: {
      states?: string[];
      districts?: string[];
      pincodes?: string[];
    };
    cropTypes?: string[];
    farmSize?: {
      min?: number;
      max?: number;
    };
    all?: boolean;
  };
  scheduling: {
    sendAt?: Date;
    timezone?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };
  delivery: {
    sent: boolean;
    sentAt?: Date;
    deliveryStatus: {
      push?: { sent: boolean; sentAt?: Date; error?: string };
      sms?: { sent: boolean; sentAt?: Date; error?: string };
      email?: { sent: boolean; sentAt?: Date; error?: string };
      whatsapp?: { sent: boolean; sentAt?: Date; error?: string };
      inApp?: { sent: boolean; sentAt?: Date; error?: string };
    };
    recipients: {
      userId: mongoose.Types.ObjectId;
      channels: string[];
      delivered: boolean;
      deliveredAt?: Date;
      read: boolean;
      readAt?: Date;
      clicked?: boolean;
      clickedAt?: Date;
    }[];
  };
  analytics: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    deliveryRate: number;
    readRate: number;
    clickRate: number;
  };
  actionRequired: boolean;
  actionUrl?: string;
  actionData?: Record<string, unknown>;
  expiresAt?: Date;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['weather', 'market', 'pest', 'irrigation', 'scheme', 'loan', 'trading', 'general', 'system'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: Schema.Types.Mixed,
  channels: [{
    type: String,
    enum: ['push', 'sms', 'email', 'whatsapp', 'in-app'],
    required: true
  }],
  targetAudience: {
    userIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    roles: [{
      type: String,
      enum: ['farmer', 'buyer', 'admin', 'agent']
    }],
    locations: {
      states: [String],
      districts: [String],
      pincodes: [String]
    },
    cropTypes: [String],
    farmSize: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    all: { type: Boolean, default: false }
  },
  scheduling: {
    sendAt: Date,
    timezone: { type: String, default: 'Asia/Kolkata' },
    recurring: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: { type: Number, min: 1 },
      endDate: Date
    }
  },
  delivery: {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    deliveryStatus: {
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      whatsapp: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      inApp: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      }
    },
    recipients: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      channels: [String],
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      read: { type: Boolean, default: false },
      readAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date
    }]
  },
  analytics: {
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
    totalClicked: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    readRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 }
  },
  actionRequired: { type: Boolean, default: false },
  actionUrl: String,
  actionData: Schema.Types.Mixed,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ 'delivery.sent': 1 });
notificationSchema.index({ 'scheduling.sendAt': 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ isActive: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'targetAudience.locations.states': 1 });
notificationSchema.index({ 'targetAudience.locations.districts': 1 });
notificationSchema.index({ 'targetAudience.cropTypes': 1 });

// TTL index for expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', notificationSchema);
