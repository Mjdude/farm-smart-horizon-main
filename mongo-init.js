// MongoDB initialization script
db = db.getSiblingDB('farm-smart-horizon');

// Create application user
db.createUser({
  user: 'farmapp',
  pwd: 'farmapp123',
  roles: [
    {
      role: 'readWrite',
      db: 'farm-smart-horizon'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "profile.location.state": 1 });
db.users.createIndex({ "profile.location.district": 1 });
db.users.createIndex({ "profile.cropTypes": 1 });

db.schemes.createIndex({ "category": 1 });
db.schemes.createIndex({ "provider": 1 });
db.schemes.createIndex({ "isActive": 1 });
db.schemes.createIndex({ "eligibility.states": 1 });

db.schemeapplications.createIndex({ "userId": 1 });
db.schemeapplications.createIndex({ "schemeId": 1 });
db.schemeapplications.createIndex({ "status": 1 });
db.schemeapplications.createIndex({ "applicationId": 1 }, { unique: true });

db.croplistings.createIndex({ "farmerId": 1 });
db.croplistings.createIndex({ "cropType": 1 });
db.croplistings.createIndex({ "status": 1 });
db.croplistings.createIndex({ "location.state": 1, "location.district": 1 });
db.croplistings.createIndex({ "pricePerUnit": 1 });
db.croplistings.createIndex({ "availableUntil": 1 });

db.loanapplications.createIndex({ "userId": 1 });
db.loanapplications.createIndex({ "status": 1 });
db.loanapplications.createIndex({ "loanType": 1 });
db.loanapplications.createIndex({ "applicationId": 1 }, { unique: true });

db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "type": 1 });
db.notifications.createIndex({ "priority": 1 });
db.notifications.createIndex({ "createdAt": -1 });
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Insert sample data for development
db.schemes.insertMany([
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Income support scheme providing ₹6000 per year to small and marginal farmers",
    category: "income-support",
    provider: "Government of India",
    eligibility: {
      criteria: ["Small & Marginal farmers", "Land holding up to 2 hectares", "Valid Aadhaar card"],
      farmSize: { max: 2 },
      category: ["marginal", "small"]
    },
    benefits: {
      type: "monetary",
      amount: 6000,
      description: "₹6000 per year in 3 installments of ₹2000 each"
    },
    applicationProcess: {
      documents: ["Aadhaar Card", "Bank Account Details", "Land Records", "Mobile Number"],
      steps: ["Online Registration", "Document Verification", "Approval", "Disbursement"],
      processingTime: "15-30 days"
    },
    isActive: true,
    priority: 1,
    tags: ["income", "support", "farmers"]
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Crop insurance scheme providing financial support against crop loss",
    category: "insurance",
    provider: "Government of India",
    eligibility: {
      criteria: ["All farmers", "Enrolled crops", "Premium payment within deadline"]
    },
    benefits: {
      type: "insurance",
      description: "Up to 100% sum insured for crop losses"
    },
    applicationProcess: {
      documents: ["Aadhaar Card", "Bank Account", "Land Records", "Sowing Certificate"],
      steps: ["Enrollment", "Premium Payment", "Crop Assessment", "Claim Settlement"],
      processingTime: "7-15 days"
    },
    isActive: true,
    priority: 2,
    tags: ["insurance", "crop", "protection"]
  }
]);

print("Database initialized successfully with indexes and sample data");
