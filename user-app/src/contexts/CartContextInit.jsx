import { createContext } from 'react';

// Create the Cart context with default values
export const CartContext = createContext({
  cartItems: [],
  total: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});
