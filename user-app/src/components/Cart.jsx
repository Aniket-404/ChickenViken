import { useCart } from '../contexts/CartContext/hooks';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
    return (
    <div className="flex items-center justify-between p-4 border-b">      <div className="flex items-center">        <img 
          src={item.imageUrl || item.image || 'https://via.placeholder.com/150?text=No+Image&bgcolor=F28B82&color=FFFFFF'} 
          alt={item.name} 
          className="w-16 h-16 object-cover rounded-standard"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150?text=No+Image&bgcolor=F28B82&color=FFFFFF';
          }}
        />
        <div className="ml-4">          <h3 className="font-medium">{item.name}</h3>
          <p className="text-gray-600 text-sm">{formatCurrency(item.price)}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center border rounded-standard mr-4">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="px-2 py-1 border-r hover:bg-gray-100"
          >
            -
          </button>
          <span className="px-3 py-1">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="px-2 py-1 border-l hover:bg-gray-100"
          >
            +
          </button>
        </div>
          <p className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
          <button 
          onClick={() => removeFromCart(item.id)}
          className="ml-4 text-primary-dark hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8">Add some delicious chicken products to your cart.</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }
    return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <button 
          onClick={clearCart}
          className="text-primary-dark hover:text-primary flex items-center"
        >
          Clear Cart
        </button>
      </div>
      
      {!currentUser && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4">
          <p className="font-medium">Please <Link to="/login" className="text-primary-dark hover:underline">log in</Link> to complete your purchase.</p>
        </div>
      )}
      
      <div className="card">
        <div className="p-4 bg-gray-50 border-b font-medium flex justify-between">
          <span>Product</span>
          <span>Subtotal</span>
        </div>
          <div>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
          <div className="p-4 bg-gray-50 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-xl">{formatCurrency(total)}</span>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        {currentUser ? (
          <Link to="/checkout" className="btn-primary">
            Proceed to Checkout
          </Link>
        ) : (
          <Link to="/login" className="btn-primary">
            Login to Checkout
          </Link>
        )}
      </div>
    </div>
  );
};

export default Cart;
