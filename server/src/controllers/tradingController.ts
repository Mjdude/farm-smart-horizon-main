import { Request, Response } from 'express';
import CropListing, { ICropListing } from '@/models/CropListing';
import User, { IUser } from '@/models/User';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';
import { sendEmail } from '@/services/emailService';
import { sendTemplateSMS } from '@/services/smsService';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/types/express';

// Get all crop listings with filters
export const getCropListings = catchAsync(async (req: Request, res: Response) => {
  const { 
    cropType, 
    quality, 
    organic, 
    state, 
    district, 
    minPrice, 
    maxPrice, 
    minQuantity,
    maxQuantity,
    page = 1, 
    limit = 10, 
    sort = '-createdAt' 
  } = req.query;

  // Build filter
  const filter: any = { 
    status: 'active',
    availableUntil: { $gte: new Date() }
  };

  if (cropType) filter.cropType = cropType;
  if (quality) filter.quality = quality;
  if (organic !== undefined) filter.organic = organic === 'true';
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;

  // Price range filter
  if (minPrice || maxPrice) {
    filter.pricePerUnit = {};
    if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
  }

  // Quantity range filter
  if (minQuantity || maxQuantity) {
    filter.quantity = {};
    if (minQuantity) filter.quantity.$gte = Number(minQuantity);
    if (maxQuantity) filter.quantity.$lte = Number(maxQuantity);
  }

  // Get listings
  const listings = await CropListing.find(filter)
    .populate('farmerId', 'name phone profile.location')
    .sort(sort as string)
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await CropListing.countDocuments(filter);

  // Update view count for each listing
  const listingIds = listings.map(listing => listing._id);
  await CropListing.updateMany(
    { _id: { $in: listingIds } },
    { $inc: { views: 1 } }
  );

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Get crop listing by ID
export const getCropListingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await CropListing.findById(id)
    .populate('farmerId', 'name phone email profile');

  if (!listing) {
    throw new AppError('Crop listing not found', 404);
  }

  // Increment view count
  listing.views += 1;
  await listing.save();

  res.json({
    success: true,
    data: { listing }
  });
});

// Create new crop listing
export const createCropListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const farmerId = req.user!._id;
  
  // Validate farmer role
  if (req.user!.role !== 'farmer') {
    throw new AppError('Only farmers can create crop listings', 403);
  }

  const listingData = {
    ...req.body,
    farmerId,
    location: req.user!.profile.location,
    status: 'active'
  };

  // Set default availability period if not provided
  if (!listingData.availableUntil) {
    const availableUntil = new Date();
    availableUntil.setDate(availableUntil.getDate() + 30); // 30 days from now
    listingData.availableUntil = availableUntil;
  }

  const listing = await CropListing.create(listingData);

  logger.info('New crop listing created', { 
    listingId: listing._id, 
    farmerId, 
    cropType: listing.cropType,
    quantity: listing.quantity 
  });

  res.status(201).json({
    success: true,
    message: 'Crop listing created successfully',
    data: { listing }
  });
});

// Update crop listing
export const updateCropListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const farmerId = req.user!._id;

  const listing = await CropListing.findOne({
    _id: id,
    farmerId,
    status: { $in: ['active', 'draft'] }
  });

  if (!listing) {
    throw new AppError('Crop listing not found or cannot be updated', 404);
  }

  // Update listing
  Object.assign(listing, req.body);
  await listing.save();

  res.json({
    success: true,
    message: 'Crop listing updated successfully',
    data: { listing }
  });
});

// Delete crop listing
export const deleteCropListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const farmerId = req.user!._id;

  const listing = await CropListing.findOne({
    _id: id,
    farmerId
  });

  if (!listing) {
    throw new AppError('Crop listing not found', 404);
  }

  listing.status = 'expired';
  await listing.save();

  res.json({
    success: true,
    message: 'Crop listing deleted successfully'
  });
});

// Get farmer's own listings
export const getFarmerListings = catchAsync(async (req: AuthRequest, res: Response) => {
  const farmerId = req.user!._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter: any = { farmerId };
  if (status) filter.status = status;

  const listings = await CropListing.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await CropListing.countDocuments(filter);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Express interest in a crop listing
export const expressInterest = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { message, quantity, proposedPrice } = req.body;
  const buyerId = req.user!._id;

  const listing = await CropListing.findById(id)
    .populate('farmerId', 'name phone email');

  if (!listing || listing.status !== 'active') {
    throw new AppError('Crop listing not found or not available', 404);
  }

  if (listing.farmerId._id.toString() === buyerId.toString()) {
    throw new AppError('You cannot express interest in your own listing', 400);
  }

  // Increment inquiry count
  listing.inquiries += 1;
  await listing.save();

  const farmer = listing.farmerId as any;
  const buyer = req.user!;

  // Send notification to farmer
  await sendEmail({
    to: farmer.email,
    subject: `New Interest in Your ${listing.cropType} Listing`,
    template: 'tradingMatch',
    data: {
      farmerName: farmer.name,
      buyerName: buyer.name,
      cropType: listing.cropType,
      quantity: quantity || listing.quantity,
      proposedPrice: proposedPrice || listing.pricePerUnit,
      message: message || 'Interested in your crop listing',
      buyerContact: buyer.phone,
      listingUrl: `${process.env.CLIENT_URL}/trading/${listing._id}`
    }
  });

  await sendTemplateSMS(farmer.phone, 'tradingMatch', {
    crop: listing.cropType,
    quantity: quantity || listing.quantity,
    price: proposedPrice || listing.pricePerUnit
  });

  // Send confirmation to buyer
  await sendEmail({
    to: buyer.email,
    subject: `Interest Sent - ${listing.cropType} from ${farmer.name}`,
    template: 'general',
    data: {
      message: `Your interest in ${listing.cropType} listing has been sent to the farmer. They will contact you soon.`
    }
  });

  res.json({
    success: true,
    message: 'Interest expressed successfully. The farmer will contact you soon.',
    data: {
      farmerContact: {
        name: farmer.name,
        phone: farmer.phone
      }
    }
  });
});

// Get market prices for different crops
export const getMarketPrices = catchAsync(async (req: Request, res: Response) => {
  const { state, district, cropType } = req.query;

  // Build aggregation pipeline
  const matchStage: any = {
    status: 'active',
    availableUntil: { $gte: new Date() }
  };

  if (state) matchStage['location.state'] = state;
  if (district) matchStage['location.district'] = district;
  if (cropType) matchStage.cropType = cropType;

  const marketPrices = await CropListing.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          cropType: '$cropType',
          state: '$location.state',
          district: '$location.district'
        },
        avgPrice: { $avg: '$pricePerUnit' },
        minPrice: { $min: '$pricePerUnit' },
        maxPrice: { $max: '$pricePerUnit' },
        totalQuantity: { $sum: '$quantity' },
        listingCount: { $sum: 1 },
        lastUpdated: { $max: '$updatedAt' }
      }
    },
    {
      $project: {
        cropType: '$_id.cropType',
        state: '$_id.state',
        district: '$_id.district',
        avgPrice: { $round: ['$avgPrice', 2] },
        minPrice: '$minPrice',
        maxPrice: '$maxPrice',
        totalQuantity: '$totalQuantity',
        listingCount: '$listingCount',
        lastUpdated: '$lastUpdated',
        _id: 0
      }
    },
    { $sort: { cropType: 1, state: 1, district: 1 } }
  ]);

  res.json({
    success: true,
    data: { marketPrices }
  });
});

// Get trending crops
export const getTrendingCrops = catchAsync(async (req: Request, res: Response) => {
  const { days = 7 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const trendingCrops = await CropListing.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$cropType',
        totalListings: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        avgPrice: { $avg: '$pricePerUnit' },
        totalViews: { $sum: '$views' },
        totalInquiries: { $sum: '$inquiries' }
      }
    },
    {
      $project: {
        cropType: '$_id',
        totalListings: 1,
        totalQuantity: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
        totalViews: 1,
        totalInquiries: 1,
        popularityScore: {
          $add: [
            { $multiply: ['$totalViews', 0.3] },
            { $multiply: ['$totalInquiries', 0.4] },
            { $multiply: ['$totalListings', 0.3] }
          ]
        },
        _id: 0
      }
    },
    { $sort: { popularityScore: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: { trendingCrops }
  });
});

// Search crop listings
export const searchCropListings = catchAsync(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const searchRegex = new RegExp(q as string, 'i');

  const filter = {
    status: 'active',
    availableUntil: { $gte: new Date() },
    $or: [
      { cropType: searchRegex },
      { variety: searchRegex },
      { description: searchRegex },
      { 'location.state': searchRegex },
      { 'location.district': searchRegex },
      { tags: { $in: [searchRegex] } }
    ]
  };

  const listings = await CropListing.find(filter)
    .populate('farmerId', 'name profile.location')
    .sort({ isPromoted: -1, createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await CropListing.countDocuments(filter);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Mark listing as sold
export const markAsSold = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const farmerId = req.user!._id;

  const listing = await CropListing.findOne({
    _id: id,
    farmerId,
    status: 'active'
  });

  if (!listing) {
    throw new AppError('Crop listing not found', 404);
  }

  listing.status = 'sold';
  await listing.save();

  res.json({
    success: true,
    message: 'Listing marked as sold successfully'
  });
});

// Get analytics for farmer
export const getFarmerAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const farmerId = req.user!._id;
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const analytics = await CropListing.aggregate([
    {
      $match: {
        farmerId: farmerId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalListings: { $sum: 1 },
        activeListings: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        soldListings: {
          $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalInquiries: { $sum: '$inquiries' },
        totalValue: {
          $sum: { $cond: [{ $eq: ['$status', 'sold'] }, '$totalValue', 0] }
        },
        avgPrice: { $avg: '$pricePerUnit' }
      }
    }
  ]);

  const result = analytics[0] || {
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalValue: 0,
    avgPrice: 0
  };

  // Calculate conversion rates
  result.inquiryRate = result.totalViews > 0 ? 
    ((result.totalInquiries / result.totalViews) * 100).toFixed(2) : 0;
  result.saleRate = result.totalListings > 0 ? 
    ((result.soldListings / result.totalListings) * 100).toFixed(2) : 0;

  res.json({
    success: true,
    data: { analytics: result }
  });
});
