import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext/index.js';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Auth pages
import AdminLogin from './pages/auth/AdminLogin';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/orders/Orders';
import Products from './pages/products/Products';
import Inventory from './pages/inventory/Inventory';
import Users from './pages/users/Users';
import Settings from './pages/settings/Settings';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Protected routes - all need admin authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
