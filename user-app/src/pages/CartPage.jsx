import Cart from '../components/Cart';
import { useCart } from '../contexts/CartContext/hooks';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems } = useCart();
    if (!cartItems.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
        <Link 
          to="/products" 
          className="btn-primary"
        >
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Cart />
    </div>
  );
};

export default CartPage;
