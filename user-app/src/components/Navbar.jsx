import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-red-600"
          >
            ChickenViken
          </motion.span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-red-600 transition-colors">Products</Link>
          
          {currentUser ? (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-red-600 transition-colors">Profile</Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-red-600 transition-colors">Login</Link>
          )}
          
          <Link to="/cart" className="relative">
            <span className="material-icons text-gray-700 hover:text-red-600 transition-colors">shopping_cart</span>
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white shadow-md mt-2 py-4"
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-red-600 transition-colors">Products</Link>
            
            {currentUser ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-red-600 transition-colors">Profile</Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-red-600 transition-colors">Login</Link>
            )}
            
            <Link to="/cart" className="text-gray-700 hover:text-red-600 transition-colors flex items-center">
              Cart {itemCount > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>}
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
