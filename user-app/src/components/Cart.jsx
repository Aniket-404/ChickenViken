import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-16 h-16 object-cover rounded"
        />
        <div className="ml-4">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-gray-600 text-sm">₹{item.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center border rounded mr-4">
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
          className="ml-4 text-red-600 hover:text-red-800"
        >
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, total, clearCart } = useCart();
  
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
          className="text-red-600 hover:text-red-800 flex items-center"
        >
          <span className="material-icons mr-1">delete</span>
          Clear Cart
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          <span className="font-bold text-xl">₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Link to="/checkout" className="btn-primary">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
