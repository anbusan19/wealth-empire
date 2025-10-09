import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users/:userId" 
            element={
              <ProtectedRoute>
                <UserDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          {/* Catch-all route for 404 pages */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <NotFoundPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </Router>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

export default App;