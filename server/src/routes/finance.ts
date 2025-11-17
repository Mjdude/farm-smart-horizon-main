import express from 'express';
import { body, param, query } from 'express-validator';
import { auth, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import LoanApplication from '@/models/LoanApplication';
import { PaymentService } from '@/services/paymentService';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

const router = express.Router();

// Loan products data
const loanProducts = [
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    provider: 'State Bank of India',
    type: 'crop-loan',
    interestRate: 7.0,
    maxAmount: 300000,
    tenure: 12,
    processingFee: 0,
    features: ['No collateral up to ₹1.6L', 'Flexible repayment', 'Interest subsidy available'],
    eligibility: ['Land ownership documents', 'Aadhaar card', 'Bank account'],
    documents: ['Land records', 'Aadhaar', 'PAN', 'Bank statements']
  },
  {
    id: 'tractor',
    name: 'Tractor Loan',
    provider: 'HDFC Bank',
    type: 'equipment',
    interestRate: 8.5,
    maxAmount: 1500000,
    tenure: 84,
    processingFee: 1.0,
    features: ['Up to 85% financing', 'Quick approval', 'Doorstep service'],
    eligibility: ['Minimum 2 years farming experience', 'Income proof', 'Land documents'],
    documents: ['Income proof', 'Land records', 'Quotation', 'Bank statements']
  }
];

// Get loan products
const getLoanProducts = catchAsync(async (req: any, res: any) => {
  const { type } = req.query;
  
  let filteredProducts = loanProducts;
  if (type) {
    filteredProducts = loanProducts.filter(product => product.type === type);
  }

  res.json({
    success: true,
    data: { loanProducts: filteredProducts }
  });
});

// Apply for loan
const applyForLoan = catchAsync(async (req: any, res: any) => {
  const userId = req.user._id;
  const applicationData = {
    ...req.body,
    userId,
    status: 'draft'
  };

  const application = await LoanApplication.create(applicationData);

  res.status(201).json({
    success: true,
    message: 'Loan application created successfully',
    data: { application }
  });
});

// Get user's loan applications
const getUserLoanApplications = catchAsync(async (req: any, res: any) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter: any = { userId };
  if (status) filter.status = status;

  const applications = await LoanApplication.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await LoanApplication.countDocuments(filter);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Calculate EMI
const calculateEMI = catchAsync(async (req: any, res: any) => {
  const { amount, rate, tenure } = req.body;

  const monthlyRate = rate / 12 / 100;
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);

  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - amount;

  res.json({
    success: true,
    data: {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      monthlyRate: monthlyRate * 100
    }
  });
});

// Create payment order
const createPaymentOrder = catchAsync(async (req: any, res: any) => {
  const { amount, currency = 'INR', receipt } = req.body;

  const result = await PaymentService.createOrder({
    amount: amount * 100, // Convert to paise
    currency,
    receipt,
    notes: {
      userId: req.user._id,
      type: 'loan_processing_fee'
    }
  });

  if (!result.success) {
    throw new AppError(result.error || 'Failed to create payment order', 500);
  }

  res.json({
    success: true,
    data: result.data
  });
});

// Verify payment
const verifyPayment = catchAsync(async (req: any, res: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const isValid = PaymentService.verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });

  if (!isValid) {
    throw new AppError('Invalid payment signature', 400);
  }

  // Update loan application status or process payment
  // Implementation depends on your business logic

  res.json({
    success: true,
    message: 'Payment verified successfully'
  });
});

// Protected routes
router.use(auth);

// Public loan product routes
router.get('/products',
  query('type').optional().isIn(['crop-loan', 'equipment', 'livestock', 'personal', 'business']),
  validate,
  getLoanProducts
);

// Loan application routes
router.post('/applications',
  body('loanType').isIn(['crop-loan', 'equipment', 'livestock', 'personal', 'business']),
  body('requestedAmount').isFloat({ min: 1000 }),
  body('tenure').isInt({ min: 1, max: 360 }),
  body('purpose').isLength({ min: 10, max: 500 }),
  validate,
  applyForLoan
);

router.get('/applications',
  query('status').optional().isIn(['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed', 'closed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getUserLoanApplications
);

// EMI calculator
router.post('/calculate-emi',
  body('amount').isFloat({ min: 1000 }),
  body('rate').isFloat({ min: 0.1, max: 50 }),
  body('tenure').isInt({ min: 1, max: 360 }),
  validate,
  calculateEMI
);

// Payment routes
router.post('/payment/create-order',
  body('amount').isFloat({ min: 1 }),
  body('currency').optional().isIn(['INR']),
  body('receipt').optional().isString(),
  validate,
  createPaymentOrder
);

router.post('/payment/verify',
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
  validate,
  verifyPayment
);

export default router;
