import { Request, Response } from 'express';
import Scheme, { IScheme } from '@/models/Scheme';
import SchemeApplication, { ISchemeApplication } from '@/models/SchemeApplication';
import User, { IUser } from '@/models/User';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';
import { sendEmail } from '@/services/emailService';
import { sendTemplateSMS } from '@/services/smsService';
import { logger } from '@/utils/logger';

interface AuthRequest extends Request {
  user?: IUser;
}

// AI-powered scheme matching algorithm
const calculateSchemeMatch = (scheme: IScheme, userProfile: any): number => {
  let score = 50; // Base score

  // Farm size matching
  if (scheme.eligibility.farmSize) {
    const { min, max } = scheme.eligibility.farmSize;
    if (min && userProfile.farmSize < min) score -= 20;
    if (max && userProfile.farmSize > max) score -= 20;
    if ((!min || userProfile.farmSize >= min) && (!max || userProfile.farmSize <= max)) {
      score += 15;
    }
  }

  // Annual income matching
  if (scheme.eligibility.annualIncome) {
    const { min, max } = scheme.eligibility.annualIncome;
    if (min && userProfile.annualIncome < min) score -= 15;
    if (max && userProfile.annualIncome > max) score -= 15;
    if ((!min || userProfile.annualIncome >= min) && (!max || userProfile.annualIncome <= max)) {
      score += 10;
    }
  }

  // Category matching
  if (scheme.eligibility.category && scheme.eligibility.category.includes(userProfile.category)) {
    score += 15;
  }

  // Crop type matching
  if (scheme.eligibility.crops && userProfile.cropTypes) {
    const matchingCrops = scheme.eligibility.crops.filter(crop => 
      userProfile.cropTypes.includes(crop)
    );
    if (matchingCrops.length > 0) {
      score += (matchingCrops.length / scheme.eligibility.crops.length) * 10;
    }
  }

  // State matching
  if (scheme.eligibility.states && userProfile.location) {
    if (scheme.eligibility.states.includes(userProfile.location.state)) {
      score += 10;
    } else {
      score -= 10;
    }
  }

  // KCC matching for credit schemes
  if (scheme.category === 'credit' && !userProfile.hasKCC) {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
};

// Get all schemes with AI-powered recommendations
export const getSchemes = catchAsync(async (req: AuthRequest, res: Response) => {
  const { category, state, cropType, page = 1, limit = 10, sort = '-priority' } = req.query;
  
  // Build filter
  const filter: any = { isActive: true };
  
  if (category) filter.category = category;
  if (state) filter['eligibility.states'] = state;
  if (cropType) filter['eligibility.crops'] = cropType;

  // Get schemes
  const schemes = await Scheme.find(filter)
    .sort(sort as string)
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Scheme.countDocuments(filter);

  // If user is authenticated, calculate match scores
  let schemesWithScores = schemes;
  if (req.user) {
    schemesWithScores = schemes.map(scheme => {
      const matchScore = calculateSchemeMatch(scheme, req.user!.profile);
      return {
        ...scheme.toObject(),
        matchScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  res.json({
    success: true,
    data: {
      schemes: schemesWithScores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Get scheme by ID
export const getSchemeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const scheme = await Scheme.findById(id);
  if (!scheme) {
    throw new AppError('Scheme not found', 404);
  }

  res.json({
    success: true,
    data: { scheme }
  });
});

// Apply for scheme (Smart Apply)
export const applyForScheme = catchAsync(async (req: AuthRequest, res: Response) => {
  const { schemeId } = req.params;
  const userId = req.user!._id;
  
  // Check if scheme exists
  const scheme = await Scheme.findById(schemeId);
  if (!scheme || !scheme.isActive) {
    throw new AppError('Scheme not found or inactive', 404);
  }

  // Check if user already applied
  const existingApplication = await SchemeApplication.findOne({
    userId,
    schemeId,
    status: { $nin: ['rejected'] }
  });

  if (existingApplication) {
    throw new AppError('You have already applied for this scheme', 400);
  }

  // Get user profile
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Calculate match score and eligibility
  const matchScore = calculateSchemeMatch(scheme, user.profile);
  
  // Perform eligibility check
  const eligibilityCheck = {
    passed: true,
    criteria: [] as any[]
  };

  // Check farm size
  if (scheme.eligibility.farmSize) {
    const { min, max } = scheme.eligibility.farmSize;
    const farmSizeCheck = {
      name: 'Farm Size',
      status: true,
      message: ''
    };

    if (min && user.profile.farmSize && user.profile.farmSize < min) {
      farmSizeCheck.status = false;
      farmSizeCheck.message = `Minimum farm size required: ${min} acres`;
      eligibilityCheck.passed = false;
    }

    if (max && user.profile.farmSize && user.profile.farmSize > max) {
      farmSizeCheck.status = false;
      farmSizeCheck.message = `Maximum farm size allowed: ${max} acres`;
      eligibilityCheck.passed = false;
    }

    eligibilityCheck.criteria.push(farmSizeCheck);
  }

  // Check annual income
  if (scheme.eligibility.annualIncome) {
    const { min, max } = scheme.eligibility.annualIncome;
    const incomeCheck = {
      name: 'Annual Income',
      status: true,
      message: ''
    };

    if (min && user.profile.annualIncome && user.profile.annualIncome < min) {
      incomeCheck.status = false;
      incomeCheck.message = `Minimum annual income required: ₹${min}`;
      eligibilityCheck.passed = false;
    }

    if (max && user.profile.annualIncome && user.profile.annualIncome > max) {
      incomeCheck.status = false;
      incomeCheck.message = `Maximum annual income allowed: ₹${max}`;
      eligibilityCheck.passed = false;
    }

    eligibilityCheck.criteria.push(incomeCheck);
  }

  // Auto-fill application data from user profile
  const applicationData = {
    personalDetails: {
      name: user.name,
      aadhaarNumber: user.profile.documents?.aadhaar,
      panNumber: user.profile.documents?.pan
    },
    contactDetails: {
      phone: user.phone,
      email: user.email,
      address: {
        street: '',
        village: user.profile.location.village,
        district: user.profile.location.district,
        state: user.profile.location.state,
        pincode: user.profile.location.pincode
      }
    },
    farmDetails: {
      farmSize: user.profile.farmSize || 0,
      landOwnership: user.profile.landOwnership,
      cropTypes: user.profile.cropTypes,
      farmingExperience: user.profile.farmingExperience
    },
    financialDetails: {
      annualIncome: user.profile.annualIncome,
      bankAccount: user.profile.bankAccount,
      hasKCC: user.profile.hasKCC
    },
    ...req.body
  };

  // Create application
  const application = await SchemeApplication.create({
    userId,
    schemeId,
    ...applicationData,
    matchScore,
    eligibilityCheck,
    status: eligibilityCheck.passed ? 'submitted' : 'draft',
    timeline: {
      submitted: eligibilityCheck.passed ? new Date() : undefined
    }
  });

  // Send confirmation notifications
  if (eligibilityCheck.passed) {
    // Send email
    await sendEmail({
      to: user.email,
      subject: `Application Submitted - ${scheme.name}`,
      template: 'schemeApproval',
      data: {
        name: user.name,
        schemeName: scheme.name,
        applicationId: application.applicationId,
        amount: scheme.benefits.amount || 'As per scheme guidelines',
        nextSteps: 'Your application is under review. You will be notified of the status.'
      }
    });

    // Send SMS
    await sendTemplateSMS(user.phone, 'schemeApproval', {
      schemeName: scheme.name,
      applicationId: application.applicationId,
      amount: scheme.benefits.amount || 'TBD'
    });
  }

  res.status(201).json({
    success: true,
    message: eligibilityCheck.passed ? 
      'Application submitted successfully' : 
      'Application saved as draft. Please complete eligibility requirements.',
    data: {
      application: {
        id: application._id,
        applicationId: application.applicationId,
        status: application.status,
        matchScore: application.matchScore,
        eligibilityCheck: application.eligibilityCheck
      }
    }
  });
});

// Get user's scheme applications
export const getUserApplications = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter: any = { userId };
  if (status) filter.status = status;

  const applications = await SchemeApplication.find(filter)
    .populate('schemeId', 'name category provider benefits')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await SchemeApplication.countDocuments(filter);

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

// Get application by ID
export const getApplicationById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const application = await SchemeApplication.findOne({
    _id: id,
    userId
  }).populate('schemeId');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  res.json({
    success: true,
    data: { application }
  });
});

// Update application
export const updateApplication = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const application = await SchemeApplication.findOne({
    _id: id,
    userId,
    status: { $in: ['draft', 'submitted'] }
  });

  if (!application) {
    throw new AppError('Application not found or cannot be updated', 404);
  }

  // Update application
  Object.assign(application, req.body);
  
  // Re-check eligibility if status is changing to submitted
  if (req.body.status === 'submitted' && application.status === 'draft') {
    application.timeline.submitted = new Date();
  }

  await application.save();

  res.json({
    success: true,
    message: 'Application updated successfully',
    data: { application }
  });
});

// Admin: Get all applications
export const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const { status, schemeId, state, page = 1, limit = 10 } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (schemeId) filter.schemeId = schemeId;
  if (state) filter['contactDetails.address.state'] = state;

  const applications = await SchemeApplication.find(filter)
    .populate('userId', 'name email phone')
    .populate('schemeId', 'name category provider')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await SchemeApplication.countDocuments(filter);

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

// Admin: Update application status
export const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewNotes, rejectionReason, approvedAmount } = req.body;

  const application = await SchemeApplication.findById(id)
    .populate('userId', 'name email phone')
    .populate('schemeId', 'name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  // Update application
  application.status = status;
  if (reviewNotes) application.reviewNotes = reviewNotes;
  if (rejectionReason) application.rejectionReason = rejectionReason;
  if (approvedAmount) application.approvedAmount = approvedAmount;

  // Update timeline
  if (status === 'approved') {
    application.timeline.approved = new Date();
  } else if (status === 'rejected') {
    application.timeline.rejected = new Date();
  } else if (status === 'under-review') {
    application.timeline.reviewed = new Date();
  }

  await application.save();

  // Send notifications
  const user = application.userId as any;
  const scheme = application.schemeId as any;

  if (status === 'approved') {
    await sendEmail({
      to: user.email,
      subject: `Application Approved - ${scheme.name}`,
      template: 'schemeApproval',
      data: {
        name: user.name,
        schemeName: scheme.name,
        applicationId: application.applicationId,
        amount: approvedAmount || 'As per scheme guidelines',
        nextSteps: 'Disbursement process will begin shortly.'
      }
    });

    await sendTemplateSMS(user.phone, 'schemeApproval', {
      schemeName: scheme.name,
      applicationId: application.applicationId,
      amount: approvedAmount || 'TBD'
    });
  }

  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
});

// Create new scheme (Admin only)
export const createScheme = catchAsync(async (req: Request, res: Response) => {
  const scheme = await Scheme.create(req.body);

  logger.info('New scheme created', { schemeId: scheme._id, name: scheme.name });

  res.status(201).json({
    success: true,
    message: 'Scheme created successfully',
    data: { scheme }
  });
});

// Update scheme (Admin only)
export const updateScheme = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const scheme = await Scheme.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!scheme) {
    throw new AppError('Scheme not found', 404);
  }

  res.json({
    success: true,
    message: 'Scheme updated successfully',
    data: { scheme }
  });
});

// Delete scheme (Admin only)
export const deleteScheme = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const scheme = await Scheme.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!scheme) {
    throw new AppError('Scheme not found', 404);
  }

  res.json({
    success: true,
    message: 'Scheme deactivated successfully'
  });
});
