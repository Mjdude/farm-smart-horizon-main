import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

interface PaymentOptions {
  amount: number; // in paise (₹1 = 100 paise)
  currency?: string;
  receipt?: string;
  notes?: any;
}

interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export class PaymentService {
  // Create payment order
  static async createOrder(options: PaymentOptions) {
    try {
      const order = await razorpay.orders.create({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt || `receipt_${Date.now()}`,
        notes: options.notes || {}
      });

      logger.info('Payment order created successfully', { orderId: order.id });
      return {
        success: true,
        data: order
      };
    } catch (error) {
      logger.error('Failed to create payment order:', error);
      return {
        success: false,
        error: 'Failed to create payment order'
      };
    }
  }

  // Verify payment signature
  static verifyPayment(verification: PaymentVerification): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification;
      
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      const isValid = expectedSignature === razorpay_signature;
      
      if (isValid) {
        logger.info('Payment verification successful', { paymentId: razorpay_payment_id });
      } else {
        logger.warn('Payment verification failed', { paymentId: razorpay_payment_id });
      }

      return isValid;
    } catch (error) {
      logger.error('Payment verification error:', error);
      return false;
    }
  }

  // Get payment details
  static async getPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        data: payment
      };
    } catch (error) {
      logger.error('Failed to fetch payment details:', error);
      return {
        success: false,
        error: 'Failed to fetch payment details'
      };
    }
  }

  // Refund payment
  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount, // If amount not provided, full refund
        speed: 'normal'
      });

      logger.info('Refund processed successfully', { refundId: refund.id });
      return {
        success: true,
        data: refund
      };
    } catch (error) {
      logger.error('Failed to process refund:', error);
      return {
        success: false,
        error: 'Failed to process refund'
      };
    }
  }

  // Create subscription (for premium features)
  static async createSubscription(planId: string, customerId: string, totalCount?: number) {
    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount || 12, // 12 months by default
        quantity: 1,
        notes: {
          service: 'Farm Smart Horizon Premium'
        }
      });

      logger.info('Subscription created successfully', { subscriptionId: subscription.id });
      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      logger.error('Failed to create subscription:', error);
      return {
        success: false,
        error: 'Failed to create subscription'
      };
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
    try {
      const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
        cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0
      });

      logger.info('Subscription cancelled successfully', { subscriptionId });
      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      return {
        success: false,
        error: 'Failed to cancel subscription'
      };
    }
  }

  // Create customer for subscription
  static async createCustomer(customerData: any) {
    try {
      const customer = await razorpay.customers.create({
        name: customerData.name,
        email: customerData.email,
        contact: customerData.phone,
        notes: customerData.notes || {}
      });

      logger.info('Customer created successfully', { customerId: customer.id });
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      logger.error('Failed to create customer:', error);
      return {
        success: false,
        error: 'Failed to create customer'
      };
    }
  }

  // Transfer funds (for marketplace transactions)
  static async transferFunds(accountId: string, amount: number, currency: string = 'INR') {
    try {
      const transfer = await razorpay.transfers.create({
        account: accountId,
        amount: amount,
        currency: currency,
        notes: {
          purpose: 'Marketplace transaction'
        }
      });

      logger.info('Fund transfer successful', { transferId: transfer.id });
      return {
        success: true,
        data: transfer
      };
    } catch (error) {
      logger.error('Failed to transfer funds:', error);
      return {
        success: false,
        error: 'Failed to transfer funds'
      };
    }
  }

  // Create linked account (for marketplace sellers)
  static async createLinkedAccount(accountData: any) {
    try {
      const account = await razorpay.accounts.create({
        email: accountData.email,
        phone: accountData.phone,
        type: 'route',
        reference_id: accountData.reference_id,
        legal_business_name: accountData.business_name,
        business_type: accountData.business_type || 'individual',
        contact_name: accountData.contact_name,
        profile: {
          category: 'agriculture',
          subcategory: 'farming',
          addresses: {
            registered: {
              street1: accountData.address.street,
              street2: accountData.address.area,
              city: accountData.address.city,
              state: accountData.address.state,
              postal_code: accountData.address.pincode,
              country: 'IN'
            }
          }
        },
        legal_info: {
          pan: accountData.pan,
          gst: accountData.gst
        },
        brand: {
          color: '000000'
        },
        notes: accountData.notes || {}
      });

      logger.info('Linked account created successfully', { accountId: account.id });
      return {
        success: true,
        data: account
      };
    } catch (error) {
      logger.error('Failed to create linked account:', error);
      return {
        success: false,
        error: 'Failed to create linked account'
      };
    }
  }
}
