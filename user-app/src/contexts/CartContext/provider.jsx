import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from './context';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [total, setTotal] = useState(() => {
    // Initialize total from saved cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    return 0;
  });
  // Check for pending cart items on mount
  useEffect(() => {
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      try {
        // Validate that the item is properly formatted
        JSON.parse(pendingCartItem);
        // We'll handle adding this item in the Login/Signup components
      } catch (error) {
        console.error('Error parsing pending cart item:', error);
        localStorage.removeItem('pendingCartItem');
      }
    }
  }, []);

  // Update localStorage and total whenever cart changes
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update total
      const newTotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      setTotal(newTotal);
      
      // Debug log
      console.log('Cart updated:', { items: cartItems, total: newTotal });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartItems]);
    // Add item to cart
  const addToCart = (item) => {
    if (!item || !item.id || !item.price) {
      console.error('Invalid item data:', item);
      return;
    }

    setCartItems(prevItems => {
      try {
        const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
        
        if (existingItemIndex >= 0) {
          // Item exists, update quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: (updatedItems[existingItemIndex].quantity || 0) + (item.quantity || 1),
            // Ensure we have the latest item data
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl
          };
          return updatedItems;
        } else {
          // Item doesn't exist, add it with all required fields
          const newItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity || 1
          };
          return [...prevItems, newItem];
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return prevItems;
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

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
