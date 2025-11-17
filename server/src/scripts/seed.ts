import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Scheme from '@/models/Scheme';
import { logger } from '@/utils/logger';

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-smart-horizon');
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data (optional - remove in production)
    if (process.env.NODE_ENV !== 'production') {
      await User.deleteMany({});
      await Scheme.deleteMany({});
      logger.info('Cleared existing data');
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@farmsmarthorizon.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'admin',
      profile: {
        location: {
          state: 'Delhi',
          district: 'New Delhi',
          village: 'Central Delhi',
          pincode: '110001'
        },
        cropTypes: [],
        farmingExperience: 0,
        landOwnership: 'owned',
        category: 'small',
        hasKCC: false,
        bankAccount: {}
      },
      isVerified: true,
      isActive: true
    });
    logger.info('Created admin user');

    // Create sample farmer
    const farmerPassword = await bcrypt.hash('farmer123', 12);
    const farmerUser = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9876543210',
      password: farmerPassword,
      role: 'farmer',
      profile: {
        farmSize: 2.5,
        location: {
          state: 'Haryana',
          district: 'Karnal',
          village: 'Gharaunda',
          pincode: '132114'
        },
        cropTypes: ['Rice', 'Wheat'],
        farmingExperience: 15,
        annualIncome: 180000,
        landOwnership: 'owned',
        category: 'small',
        hasKCC: true,
        bankAccount: {
          accountNumber: '1234567890',
          ifscCode: 'SBI0001234',
          bankName: 'State Bank of India',
          accountHolderName: 'Rajesh Kumar'
        }
      },
      isVerified: true,
      isActive: true
    });
    logger.info('Created sample farmer');

    // Create sample buyer
    const buyerPassword = await bcrypt.hash('buyer123', 12);
    const buyerUser = await User.create({
      name: 'Fresh Mart Pvt Ltd',
      email: 'buyer@freshmart.com',
      phone: '9876543211',
      password: buyerPassword,
      role: 'buyer',
      profile: {
        location: {
          state: 'Delhi',
          district: 'New Delhi',
          village: 'Connaught Place',
          pincode: '110001'
        },
        cropTypes: ['Rice', 'Wheat', 'Vegetables'],
        farmingExperience: 0,
        landOwnership: 'owned',
        category: 'large',
        hasKCC: false,
        bankAccount: {}
      },
      isVerified: true,
      isActive: true
    });
    logger.info('Created sample buyer');

    // Create government schemes
    const schemes = [
      {
        name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        description: "Income support scheme providing ₹6000 per year to small and marginal farmers",
        category: "income-support",
        provider: "Government of India",
        eligibility: {
          criteria: ["Small & Marginal farmers", "Land holding up to 2 hectares", "Valid Aadhaar card"],
          farmSize: { max: 2 },
          category: ["marginal", "small"],
          states: ["Haryana", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan"]
        },
        benefits: {
          type: "monetary",
          amount: 6000,
          description: "₹6000 per year in 3 installments of ₹2000 each",
          duration: "Annual"
        },
        applicationProcess: {
          documents: ["Aadhaar Card", "Bank Account Details", "Land Records", "Mobile Number"],
          steps: ["Online Registration", "Document Verification", "Approval", "Disbursement"],
          processingTime: "15-30 days",
          applicationUrl: "https://pmkisan.gov.in"
        },
        timeline: {
          applicationStart: new Date('2024-01-01'),
          applicationEnd: new Date('2024-12-31')
        },
        isActive: true,
        priority: 1,
        tags: ["income", "support", "farmers", "pm-kisan"]
      },
      {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme providing financial support against crop loss due to natural calamities",
        category: "insurance",
        provider: "Government of India",
        eligibility: {
          criteria: ["All farmers", "Enrolled crops", "Premium payment within deadline"],
          crops: ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize"]
        },
        benefits: {
          type: "insurance",
          description: "Up to 100% sum insured for crop losses due to natural calamities, pests & diseases"
        },
        applicationProcess: {
          documents: ["Aadhaar Card", "Bank Account", "Land Records", "Sowing Certificate"],
          steps: ["Enrollment", "Premium Payment", "Crop Assessment", "Loss Assessment", "Claim Settlement"],
          processingTime: "7-15 days for enrollment, 30-45 days for claims",
          applicationUrl: "https://pmfby.gov.in"
        },
        isActive: true,
        priority: 2,
        tags: ["insurance", "crop", "protection", "pmfby"]
      },
      {
        name: "Kisan Credit Card (KCC)",
        description: "Credit facility for farmers to meet their agricultural and allied activities",
        category: "credit",
        provider: "Banks & Financial Institutions",
        eligibility: {
          criteria: ["All farmers", "Valid land documents", "Good credit history"],
          farmSize: { min: 0.1 }
        },
        benefits: {
          type: "credit",
          amount: 300000,
          description: "Credit up to ₹3 lakh at subsidized interest rates (7% for prompt repayment)"
        },
        applicationProcess: {
          documents: ["Aadhaar Card", "PAN Card", "Land Documents", "Income Certificate", "Bank Statements"],
          steps: ["Application Submission", "Document Verification", "Credit Assessment", "Approval", "Card Issuance"],
          processingTime: "7-15 days"
        },
        isActive: true,
        priority: 3,
        tags: ["credit", "kcc", "loan", "agriculture"]
      },
      {
        name: "Soil Health Card Scheme",
        description: "Providing soil health cards to farmers with recommendations for appropriate nutrients and fertilizers",
        category: "agricultural-support",
        provider: "Department of Agriculture & Cooperation",
        eligibility: {
          criteria: ["All farmers", "Valid land records"],
          farmSize: { min: 0.1 }
        },
        benefits: {
          type: "services",
          description: "Free soil testing and nutrient recommendations to improve soil health and crop productivity"
        },
        applicationProcess: {
          documents: ["Land Records", "Aadhaar Card", "Mobile Number"],
          steps: ["Registration", "Soil Sample Collection", "Laboratory Testing", "Card Generation", "Distribution"],
          processingTime: "15-30 days"
        },
        isActive: true,
        priority: 4,
        tags: ["soil", "health", "testing", "nutrients"]
      },
      {
        name: "National Mission for Sustainable Agriculture (NMSA)",
        description: "Promoting sustainable farming practices and climate resilient agriculture",
        category: "sustainability",
        provider: "Ministry of Agriculture & Farmers Welfare",
        eligibility: {
          criteria: ["Progressive farmers", "Farmer Producer Organizations", "Self Help Groups"],
          farmSize: { min: 1 }
        },
        benefits: {
          type: "subsidy",
          percentage: 50,
          description: "50% subsidy on sustainable farming equipment and practices"
        },
        applicationProcess: {
          documents: ["Group Certificate", "Project Proposal", "Land Records", "Bank Account Details"],
          steps: ["Project Preparation", "Technical Approval", "Financial Sanction", "Implementation", "Monitoring"],
          processingTime: "30-60 days"
        },
        isActive: true,
        priority: 5,
        tags: ["sustainability", "climate", "resilient", "nmsa"]
      }
    ];

    await Scheme.insertMany(schemes);
    logger.info(`Created ${schemes.length} government schemes`);

    logger.info('Database seeding completed successfully');
    
    // Display created accounts
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n👤 Test Accounts Created:');
    console.log('📧 Admin: admin@farmsmarthorizon.com | Password: admin123');
    console.log('🌾 Farmer: rajesh@example.com | Password: farmer123');
    console.log('🏪 Buyer: buyer@freshmart.com | Password: buyer123');
    console.log(`\n📋 Created ${schemes.length} government schemes`);
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
