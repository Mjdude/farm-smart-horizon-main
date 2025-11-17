#!/bin/bash

# Farm Smart Horizon Deployment Script
set -e

echo "🚀 Starting Farm Smart Horizon deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it and try again."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  .env file not found. Using .env.production as template..."
    cp .env.production .env
    echo "📝 Please edit .env file with your actual values and run the script again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server/uploads
mkdir -p server/logs
mkdir -p ssl

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB is not responding"
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is not responding"
    exit 1
fi

# Check Backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Run database migrations/seeding
echo "🌱 Initializing database..."
docker-compose exec -T backend npm run seed

# Display deployment information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   MongoDB: mongodb://localhost:27017"
echo "   Redis: redis://localhost:6379"
echo ""
echo "📝 Next steps:"
echo "   1. Configure SSL certificates in ./ssl/ directory"
echo "   2. Update DNS records to point to your server"
echo "   3. Configure monitoring and backup systems"
echo "   4. Set up CI/CD pipeline for automated deployments"
echo ""
echo "📚 Documentation: https://github.com/your-repo/farm-smart-horizon"
echo "🐛 Issues: https://github.com/your-repo/farm-smart-horizon/issues"
echo ""

# Show running containers
echo "🐳 Running containers:"
docker-compose ps
