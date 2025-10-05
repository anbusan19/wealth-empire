# Wealth Empire Backend

Backend API for the Wealth Empire Health Check Platform.

## Features

- **User Authentication**: Firebase integration with MongoDB user storage
- **Onboarding System**: Multi-step user profile completion
- **Health Check Results**: Store and retrieve compliance assessment data
- **MongoDB Integration**: Secure data storage with MongoDB Atlas
- **RESTful API**: Clean API endpoints for frontend integration

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```
   MONGODB_URL=your_mongodb_connection_string
   PORT=3000
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/firebase-auth` - Register/login user after Firebase auth
- `GET /api/auth/profile` - Get current user profile

### Onboarding
- `POST /api/onboarding/complete` - Complete user onboarding
- `GET /api/onboarding/status` - Check onboarding status
- `PATCH /api/onboarding/update` - Update onboarding data

### Health Check
- `POST /api/health-check/save-results` - Save health check results
- `GET /api/health-check/history` - Get user's health check history
- `GET /api/health-check/latest` - Get latest health check result
- `DELETE /api/health-check/result/:id` - Delete specific result

### Users
- `GET /api/users/dashboard` - Get user dashboard data
- `PATCH /api/users/subscription` - Update subscription plan
- `GET /api/users/stats` - Get platform statistics (admin)

## Data Models

### User Schema
- Firebase UID (unique identifier)
- Email and display name
- Onboarding data (startup name, location, founder info)
- Health check results history
- Subscription information
- Timestamps and metadata

### Health Check Results
- Overall compliance score
- Category-wise scores
- User answers and follow-up responses
- Strengths, red flags, and risk assessments
- Completion timestamp

## Security Features

- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Firebase token authentication

## Development

The server runs on port 3000 by default and connects to MongoDB Atlas. Make sure your MongoDB connection string is properly URL-encoded, especially special characters in the password.

## Health Check

Visit `http://localhost:3000/api/health` to verify the server is running.