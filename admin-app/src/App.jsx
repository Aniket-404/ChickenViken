import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// Import admin components and pages here
// (We'll create these next)

// Protected route component for admin
const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('adminUser') !== null;
  return isAdminAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Admin Routes will go here */}
          <Routes>
            <Route path="/login" element={<div>Admin Login Page (To be created)</div>} />
            <Route 
              path="/" 
              element={
                <AdminProtectedRoute>
                  <div>Admin Dashboard (To be created)</div>
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
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
