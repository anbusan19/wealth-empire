# Admin Dashboard Access Guide

## 🔐 Login Credentials

To access the admin dashboard, use these demo credentials:

- **Email**: `admin@wealthempires.in`
- **Password**: `admin123`

## 🚀 Getting Started

1. **Start the Backend Server** (if not already running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Admin Dashboard**:
   ```bash
   cd admin
   npm run dev
   ```

3. **Access the Dashboard**:
   - Open your browser and go to: `http://localhost:5174`
   - You'll be redirected to the login page
   - Enter the credentials above
   - You'll be taken to the admin dashboard

## 📊 Available Features

### Dashboard Overview (`/`)
- Total users and health checks statistics
- Average compliance scores
- Revenue tracking
- Critical issues monitoring

### Users Management (`/users`)
- View all registered users
- Search and filter capabilities
- User profile details
- Subscription tracking

### **Reports Management (`/reports`)** ⭐
- **Enhanced Reports View**: All user compliance reports in a modern card layout
- **Risk Level Indicators**: Color-coded risk levels (low, medium, high, critical)
- **Detailed Information**: Scores, completion dates, strengths, and issues
- **Advanced Filtering**: Search by company name, filter by status and date ranges
- **One-click Navigation**: Click any report card to view detailed analysis

### Report Details (`/reports/:userId/:reportId`)
- **Complete User Profile**: Startup and founder information
- **Comprehensive Analysis**: Detailed compliance scores and risk assessment
- **Categorized Recommendations**: Organized by strengths, risks, and red flags
- **Raw Assessment Data**: View original answers and follow-up responses

## 🔧 Technical Notes

- The admin dashboard runs on port **5174**
- Backend API runs on port **3001**
- Authentication uses localStorage for demo purposes
- All routes are protected and require login

## 🎯 Key Admin Capabilities

1. **Monitor User Activity**: Track user registrations, logins, and engagement
2. **Analyze Compliance Trends**: View platform-wide compliance statistics
3. **Identify Critical Issues**: Spot users with low compliance scores
4. **Export Data**: Download reports for further analysis
5. **User Support**: Access detailed user profiles and assessment history

---

**Note**: This is a demo setup. In production, implement proper admin authentication with JWT tokens and role-based access control.