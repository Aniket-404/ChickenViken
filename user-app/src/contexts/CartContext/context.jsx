import { createContext } from 'react';

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
