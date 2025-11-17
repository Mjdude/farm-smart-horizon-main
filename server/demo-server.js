const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data for demonstration
const mockSchemes = [
  {
    id: '1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Income support scheme providing ₹6000 per year to small and marginal farmers',
    category: 'income-support',
    provider: 'Government of India',
    benefits: {
      type: 'monetary',
      amount: 6000,
      description: '₹6000 per year in 3 installments of ₹2000 each'
    },
    matchScore: 95,
    eligibility: {
      criteria: ['Small & Marginal farmers', 'Land holding up to 2 hectares', 'Valid Aadhaar card']
    }
  },
  {
    id: '2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme providing financial support against crop loss',
    category: 'insurance',
    provider: 'Government of India',
    benefits: {
      type: 'insurance',
      description: 'Up to 100% sum insured for crop losses'
    },
    matchScore: 88,
    eligibility: {
      criteria: ['All farmers', 'Enrolled crops', 'Premium payment within deadline']
    }
  }
];

const mockCropListings = [
  {
    id: '1',
    farmerId: { name: 'Rajesh Kumar', phone: '9876543210' },
    cropType: 'Rice',
    variety: 'Basmati 1121',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 45,
    quality: 'Premium',
    organic: true,
    location: { state: 'Haryana', district: 'Karnal' },
    harvestDate: '2024-10-15',
    availableUntil: '2024-11-30'
  },
  {
    id: '2',
    farmerId: { name: 'Priya Sharma', phone: '9876543211' },
    cropType: 'Wheat',
    variety: 'HD-2967',
    quantity: 1000,
    unit: 'kg',
    pricePerUnit: 30,
    quality: 'Grade A',
    organic: false,
    location: { state: 'Punjab', district: 'Ludhiana' },
    harvestDate: '2024-10-20',
    availableUntil: '2024-12-15'
  }
];

const mockLoanProducts = [
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    provider: 'State Bank of India',
    type: 'crop-loan',
    interestRate: 7.0,
    maxAmount: 300000,
    tenure: 12,
    features: ['No collateral up to ₹1.6L', 'Flexible repayment', 'Interest subsidy available']
  },
  {
    id: 'tractor',
    name: 'Tractor Loan',
    provider: 'HDFC Bank',
    type: 'equipment',
    interestRate: 8.5,
    maxAmount: 1500000,
    tenure: 84,
    features: ['Up to 85% financing', 'Quick approval', 'Doorstep service']
  }
];

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Farm Smart Horizon API is running!' });
});

// Schemes API
app.get('/api/schemes', (req, res) => {
  const { category, state } = req.query;
  let filteredSchemes = mockSchemes;
  
  if (category) {
    filteredSchemes = filteredSchemes.filter(scheme => scheme.category === category);
  }
  
  res.json({
    success: true,
    data: {
      schemes: filteredSchemes,
      pagination: { page: 1, limit: 10, total: filteredSchemes.length, pages: 1 }
    }
  });
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = mockSchemes.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }
  res.json({ success: true, data: { scheme } });
});

// Trading API
app.get('/api/trading/listings', (req, res) => {
  const { cropType, quality, state } = req.query;
  let filteredListings = mockCropListings;
  
  if (cropType) {
    filteredListings = filteredListings.filter(listing => 
      listing.cropType.toLowerCase().includes(cropType.toLowerCase())
    );
  }
  
  if (quality) {
    filteredListings = filteredListings.filter(listing => listing.quality === quality);
  }
  
  if (state) {
    filteredListings = filteredListings.filter(listing => 
      listing.location.state.toLowerCase().includes(state.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: {
      listings: filteredListings,
      pagination: { page: 1, limit: 10, total: filteredListings.length, pages: 1 }
    }
  });
});

app.get('/api/trading/listings/:id', (req, res) => {
  const listing = mockCropListings.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  res.json({ success: true, data: { listing } });
});

// Finance API
app.get('/api/finance/products', (req, res) => {
  const { type } = req.query;
  let filteredProducts = mockLoanProducts;
  
  if (type) {
    filteredProducts = filteredProducts.filter(product => product.type === type);
  }
  
  res.json({
    success: true,
    data: { loanProducts: filteredProducts }
  });
});

app.post('/api/finance/calculate-emi', (req, res) => {
  const { amount, rate, tenure } = req.body;
  
  if (!amount || !rate || !tenure) {
    return res.status(400).json({
      success: false,
      message: 'Amount, rate, and tenure are required'
    });
  }
  
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

// Weather API (Mock)
app.get('/api/weather/current', (req, res) => {
  res.json({
    success: true,
    data: {
      weather: {
        temperature: 28.5,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        location: { name: 'Karnal', country: 'IN' },
        timestamp: new Date()
      }
    }
  });
});

// Market API (Mock)
app.get('/api/market/prices', (req, res) => {
  res.json({
    success: true,
    data: {
      prices: [
        {
          commodity: 'Rice',
          variety: 'Basmati',
          market: 'Karnal',
          state: 'Haryana',
          minPrice: 4200,
          maxPrice: 4800,
          modalPrice: 4500,
          unit: 'Quintal',
          date: new Date().toISOString().split('T')[0]
        },
        {
          commodity: 'Wheat',
          variety: 'HD-2967',
          market: 'Ludhiana',
          state: 'Punjab',
          minPrice: 2800,
          maxPrice: 3200,
          modalPrice: 3000,
          unit: 'Quintal',
          date: new Date().toISOString().split('T')[0]
        }
      ]
    }
  });
});

// Notifications API (Mock)
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: '1',
          type: 'weather',
          priority: 'high',
          title: 'Weather Alert',
          message: 'Light rainfall expected in your area tomorrow. Good for crops!',
          createdAt: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'market',
          priority: 'medium',
          title: 'Price Update',
          message: 'Rice prices increased by 5% in Karnal market',
          createdAt: new Date(Date.now() - 3600000),
          read: false
        }
      ]
    }
  });
});

// Catch all handler
app.get('*', (req, res) => {
  res.json({
    success: true,
    message: 'Farm Smart Horizon API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      schemes: '/api/schemes',
      trading: '/api/trading/listings',
      finance: '/api/finance/products',
      weather: '/api/weather/current',
      market: '/api/market/prices',
      notifications: '/api/notifications'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Farm Smart Horizon API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌾 Schemes API: http://localhost:${PORT}/api/schemes`);
  console.log(`🛒 Trading API: http://localhost:${PORT}/api/trading/listings`);
  console.log(`💰 Finance API: http://localhost:${PORT}/api/finance/products`);
  console.log(`🌤️  Weather API: http://localhost:${PORT}/api/weather/current`);
  console.log(`📈 Market API: http://localhost:${PORT}/api/market/prices`);
  console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
});

module.exports = app;
