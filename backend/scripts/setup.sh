#!/bin/bash

# Backend Setup Script
echo "🚀 Setting up Notes App Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration values"
else
    echo "✅ .env file already exists"
fi

# Check if PostgreSQL is running
echo "🔍 Checking database connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
else
    echo "⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed and running."
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run database migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration (database, API keys, etc.)"
echo "2. Ensure PostgreSQL is running"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:3000/api-docs for API documentation"
echo ""