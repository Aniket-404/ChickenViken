import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Import admin components and pages
import AdminLogin from './pages/AdminLogin';
import DashboardComponent from './components/DashboardComponent.jsx';
import AdminCreationComponent from './pages/AdminCreationComponent.jsx';

// Protected route component for admin
const AdminProtectedRoute = ({ children }) => {
  // Check if there's an admin user in localStorage
  const isAdminAuthenticated = localStorage.getItem('adminUser') !== null;
  console.log('AdminProtectedRoute - Authentication status:', isAdminAuthenticated);
  
  // If there's a Firebase user in localStorage, consider them authenticated
  return isAdminAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AdminAuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
            <Route path="/login" element={<AdminLogin />} />            <Route 
              path="/" 
              element={
                <AdminProtectedRoute>
                  <DashboardComponent />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <AdminProtectedRoute>
                  <div>Orders Management (To be created)</div>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <AdminProtectedRoute>
                  <div>Products Management (To be created)</div>
                </AdminProtectedRoute>
              } 
            />            <Route 
              path="/admins" 
              element={
                <AdminProtectedRoute>
                  <AdminCreationComponent />
                </AdminProtectedRoute>
              } 
            /><Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </AdminAuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
