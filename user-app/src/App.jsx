import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext/provider';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import Cart from './components/Cart';
import ErrorBoundary from './components/ErrorBoundary';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const isAuthenticated = currentUser || localStorage.getItem('user') !== null;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <ErrorBoundary>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Products />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </ErrorBoundary>
            <footer className="bg-gray-800 text-white py-8">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-6 md:mb-0">
                    <h3 className="text-xl font-bold mb-4">ChickenViken</h3>
                    <p className="text-gray-400">
                      Fresh chicken meat delivered to your doorstep.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                      <ul className="space-y-2">
                        <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                        <li><a href="/products" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                      <ul className="space-y-2">
                        <li className="text-gray-400">Email: info@chickenviken.com</li>
                        <li className="text-gray-400">Phone: +91 9876543210</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                  <p>&copy; {new Date().getFullYear()} ChickenViken. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
