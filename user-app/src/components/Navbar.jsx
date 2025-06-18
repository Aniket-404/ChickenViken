import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

// Icons for cart and menu
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
      <div className="container mx-auto px-4 flex justify-between items-center">        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-red-600">
            ChickenViken
          </span>
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
            <CartIcon />
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
        
        {/* Mobile Menu Button */}        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
        {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
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
            </Link>          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
