import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

// Create cart context with default values
export const CartContext = createContext({
  cartItems: [],
  total: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  itemCount: 0,
});

// Custom hook for using cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  // Add prop types
  CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
    }
  }, []);

  // Update localStorage and total whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    const newTotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    setTotal(newTotal);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        return [...prevItems, item];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount: cartItems.length
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
