# Farm Smart Horizon API Documentation

## Overview

The Farm Smart Horizon API provides comprehensive backend services for the agricultural platform, including user management, government schemes, crop trading, financial services, and real-time notifications.

**Base URL:** `https://api.farmsmarthorizon.com/api`  
**Version:** 1.0.0  
**Authentication:** JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Government Schemes](#government-schemes)
4. [Crop Trading](#crop-trading)
5. [Financial Services](#financial-services)
6. [Notifications](#notifications)
7. [Weather Services](#weather-services)
8. [Market Data](#market-data)
9. [Admin Panel](#admin-panel)
10. [Error Handling](#error-handling)

## Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securePassword123",
  "role": "farmer",
  "profile": {
    "location": {
      "state": "Haryana",
      "district": "Karnal",
      "village": "Gharaunda",
      "pincode": "132114"
    },
    "farmSize": 2.5,
    "cropTypes": ["Rice", "Wheat"],
    "farmingExperience": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "isVerified": false
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "profile": { ... }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Headers:**
```
Cookie: refreshToken=your_refresh_token
```

## Government Schemes

### Get All Schemes
```http
GET /schemes?category=income-support&state=Haryana&page=1&limit=10
```

**Query Parameters:**
- `category` (optional): income-support, insurance, credit, agricultural-support, sustainability
- `state` (optional): Filter by state
- `cropType` (optional): Filter by crop type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "schemes": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "PM-KISAN",
        "description": "Income support scheme...",
        "category": "income-support",
        "provider": "Government of India",
        "benefits": {
          "type": "monetary",
          "amount": 6000,
          "description": "₹6000 per year in 3 installments"
        },
        "matchScore": 95,
        "eligibility": { ... }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Apply for Scheme
```http
POST /schemes/:schemeId/apply
```

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "personalDetails": {
    "name": "John Doe",
    "fatherName": "Robert Doe",
    "dateOfBirth": "1980-01-15",
    "aadhaarNumber": "123456789012"
  },
  "farmDetails": {
    "farmSize": 2.5,
    "landOwnership": "owned",
    "cropTypes": ["Rice", "Wheat"]
  },
  "financialDetails": {
    "annualIncome": 180000,
    "bankAccount": {
      "accountNumber": "1234567890",
      "ifscCode": "SBI0001234",
      "bankName": "State Bank of India"
    }
  }
}
```

### Get User Applications
```http
GET /schemes/applications/my?status=submitted&page=1&limit=10
```

## Crop Trading

### Get Crop Listings
```http
GET /trading/listings?cropType=Rice&quality=Premium&state=Haryana&page=1&limit=10
```

**Query Parameters:**
- `cropType` (optional): Rice, Wheat, Tomato, etc.
- `quality` (optional): Premium, Grade A, Grade B, Standard
- `organic` (optional): true/false
- `state` (optional): Filter by state
- `minPrice`, `maxPrice` (optional): Price range filter
- `minQuantity`, `maxQuantity` (optional): Quantity range filter

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "507f1f77bcf86cd799439011",
        "farmerId": {
          "name": "Rajesh Kumar",
          "phone": "9876543210"
        },
        "cropType": "Rice",
        "variety": "Basmati 1121",
        "quantity": 500,
        "unit": "kg",
        "pricePerUnit": 45,
        "quality": "Premium",
        "organic": true,
        "location": {
          "state": "Haryana",
          "district": "Karnal"
        },
        "harvestDate": "2024-10-15",
        "availableUntil": "2024-11-30"
      }
    ]
  }
}
```

### Create Crop Listing
```http
POST /trading/listings
```

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "cropType": "Rice",
  "variety": "Basmati 1121",
  "quantity": 500,
  "pricePerUnit": 45,
  "quality": "Premium",
  "organic": true,
  "harvestDate": "2024-10-15",
  "availableUntil": "2024-11-30",
  "description": "Premium quality Basmati rice...",
  "packaging": {
    "type": "Jute Bag",
    "weight": 50,
    "minOrder": 10
  },
  "pricing": {
    "negotiable": true
  }
}
```

### Express Interest
```http
POST /trading/listings/:id/interest
```

**Request Body:**
```json
{
  "message": "Interested in purchasing your rice",
  "quantity": 100,
  "proposedPrice": 42
}
```

## Financial Services

### Get Loan Products
```http
GET /finance/products?type=crop-loan
```

### Apply for Loan
```http
POST /finance/applications
```

**Request Body:**
```json
{
  "loanType": "crop-loan",
  "loanProduct": {
    "name": "Kisan Credit Card",
    "provider": "SBI",
    "interestRate": 7.0
  },
  "requestedAmount": 150000,
  "tenure": 12,
  "purpose": "Crop cultivation for Rabi season",
  "applicantDetails": { ... },
  "farmDetails": { ... },
  "financialDetails": { ... }
}
```

### Calculate EMI
```http
POST /finance/calculate-emi
```

**Request Body:**
```json
{
  "amount": 150000,
  "rate": 7.5,
  "tenure": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emi": 13076,
    "totalAmount": 156912,
    "totalInterest": 6912
  }
}
```

## Notifications

### Get User Notifications
```http
GET /notifications?type=weather&priority=high&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "weather",
        "priority": "critical",
        "title": "Heavy Rainfall Alert",
        "message": "Heavy rainfall expected in your area...",
        "actionRequired": true,
        "actionUrl": "/weather/alerts",
        "createdAt": "2024-10-31T08:00:00Z",
        "read": false
      }
    ]
  }
}
```

### Mark as Read
```http
PATCH /notifications/:id/read
```

## Weather Services

### Get Current Weather
```http
GET /weather/current?lat=29.6857&lon=76.9905
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weather": {
      "temperature": 28.5,
      "humidity": 65,
      "windSpeed": 12,
      "condition": "Partly Cloudy",
      "location": {
        "name": "Karnal",
        "country": "IN"
      }
    }
  }
}
```

### Get Weather Forecast
```http
GET /weather/forecast?lat=29.6857&lon=76.9905&days=7
```

### Get Agriculture Advisory
```http
GET /weather/advisory?lat=29.6857&lon=76.9905&cropType=Rice
```

## Market Data

### Get Market Prices
```http
GET /market/prices?state=Haryana&commodity=Rice
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": [
      {
        "commodity": "Rice",
        "variety": "Basmati",
        "market": "Karnal",
        "state": "Haryana",
        "minPrice": 4200,
        "maxPrice": 4800,
        "modalPrice": 4500,
        "unit": "Quintal",
        "date": "2024-10-31"
      }
    ]
  }
}
```

### Get Price Trends
```http
GET /market/trends?commodity=Rice&days=30
```

## Admin Panel

### Get Dashboard Analytics
```http
GET /admin/dashboard?days=30
```

**Headers:**
```
Authorization: Bearer admin_jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": [{"count": 1250}],
      "active": [{"count": 1180}],
      "byRole": [
        {"_id": "farmer", "count": 980},
        {"_id": "buyer", "count": 200}
      ]
    },
    "schemes": {
      "total": [{"count": 450}],
      "byStatus": [
        {"_id": "approved", "count": 320},
        {"_id": "under-review", "count": 130}
      ]
    }
  }
}
```

### Get All Users
```http
GET /admin/users?role=farmer&state=Haryana&page=1&limit=20
```

### Update User
```http
PUT /admin/users/:id
```

**Request Body:**
```json
{
  "isActive": true,
  "isVerified": true,
  "role": "farmer"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email"
      }
    ]
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Invalid/Missing Token)
- `403` - Forbidden (Insufficient Permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

### Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **File Upload**: 10 requests per hour per user

## Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## WebSocket Events

The API supports real-time features via Socket.IO:

### Connection
```javascript
const socket = io('https://api.farmsmarthorizon.com');

// Join user room for personalized notifications
socket.emit('join-room', userId);

// Listen for real-time notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Listen for market updates
socket.on('market-update', (data) => {
  console.log('Market price update:', data);
});

// Listen for weather alerts
socket.on('weather-alert', (data) => {
  console.log('Weather alert:', data);
});
```

## SDKs and Libraries

### JavaScript/Node.js
```javascript
const FarmSmartAPI = require('@farmsmarthorizon/api-client');

const client = new FarmSmartAPI({
  baseURL: 'https://api.farmsmarthorizon.com/api',
  apiKey: 'your-api-key'
});

// Get schemes
const schemes = await client.schemes.getAll({
  category: 'income-support',
  state: 'Haryana'
});
```

### Python
```python
from farmsmarthorizon import FarmSmartClient

client = FarmSmartClient(
    base_url='https://api.farmsmarthorizon.com/api',
    api_key='your-api-key'
)

# Get market prices
prices = client.market.get_prices(state='Haryana', commodity='Rice')
```

## Support

- **Documentation**: https://docs.farmsmarthorizon.com
- **API Status**: https://status.farmsmarthorizon.com
- **Support Email**: api-support@farmsmarthorizon.com
- **GitHub Issues**: https://github.com/farmsmarthorizon/api/issues
