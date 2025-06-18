import { useContext } from 'react';
import { CartContext } from './context';

// Custom hook for using cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
