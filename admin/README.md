# Wealth Empire Admin Dashboard

This is the admin dashboard for monitoring and managing user compliance reports and assessments.

## Features

### 📊 Dashboard Overview
- Total users and health checks statistics
- Average compliance scores across the platform
- Revenue tracking and subscription analytics
- Critical issues monitoring

### 👥 User Management
- View all registered users with pagination and search
- Filter by subscription type and status
- Detailed user profiles with compliance history
- Track user onboarding and engagement

### 📋 Reports Management
- **Enhanced Reports View**: View all user-generated compliance reports
- **Detailed Report Analysis**: Click on any report to see comprehensive details including:
  - User profile information (startup name, founder, contact details)
  - Compliance scores and risk levels
  - Strengths, red flags, and recommendations
  - Raw assessment data and follow-up answers
- **Advanced Filtering**: Search by company name, filter by status, date ranges
- **Export Capabilities**: Download reports for further analysis

## Key Admin Features

### Reports Dashboard (`/reports`)
The reports page shows all user compliance assessments with:
- **Card-based Layout**: Easy-to-scan report cards showing key metrics
- **Risk Level Indicators**: Color-coded risk levels (low, medium, high, critical)
- **Quick Stats**: Scores, completion dates, strengths, and issues at a glance
- **One-click Navigation**: Click any report to view detailed analysis

### Report Details (`/reports/:userId/:reportId`)
Detailed view of individual reports including:
- **User Profile Section**: Complete startup and founder information
- **Score Analysis**: Visual score display with risk assessment
- **Categorized Recommendations**: Organized by strengths, risks, and red flags
- **Raw Data Access**: View original assessment answers and follow-ups

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## API Integration

The admin dashboard connects to the backend API at `https://api-wealthempires.vercel.app` with the following endpoints:

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management with pagination
- `GET /api/admin/users/:id` - Individual user details
- `GET /api/admin/reports` - All compliance reports with filtering
- `GET /api/admin/reports/:userId/:reportId` - Detailed report view

## Navigation

- **Dashboard** (`/`) - Overview and key metrics
- **Users** (`/users`) - User management and profiles
- **Reports** (`/reports`) - Compliance reports and analysis

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Vite** for build tooling

## Admin Authentication

Currently uses a simplified authentication system. In production, implement proper admin authentication with role-based access control.

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Data Visualization

- Interactive charts and graphs
- Real-time statistics updates
- Export capabilities for reports
- Advanced filtering and search

## 🔐 Quick Access

**Demo Login Credentials:**
- Email: `admin@wealthempires.in`
- Password: `admin123`

**Access URL:** `http://localhost:5174` (after running `npm run dev`)

---

**Note**: This admin dashboard provides comprehensive oversight of the Wealth Empire compliance platform, allowing administrators to monitor user engagement, track compliance trends, and identify areas needing attention.