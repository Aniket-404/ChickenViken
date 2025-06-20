import { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const handleAddToCart = () => {
    setIsAnimating(true);
    
    // Check if user is authenticated
    if (!currentUser) {
      // Save the product to local storage for adding after login
      localStorage.setItem('pendingCartItem', JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1
      }));
      
      // Redirect to login page if not authenticated
      toast.info('Please login to add items to your cart', {
        position: "bottom-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate('/login'), 1000);
      setTimeout(() => setIsAnimating(false), 200);
      return;
    }
    
    onAddToCart(product);
    
    toast.success('Added to cart!', {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (    <div className="card">
      <div className="relative aspect-square">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAddToCart}
            className={`btn-primary transform transition-all duration-200 active:scale-95
              ${isAnimating ? 'scale-90' : 'scale-100'}`}
            disabled={isAnimating}
          >
            {isAnimating ? '✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
