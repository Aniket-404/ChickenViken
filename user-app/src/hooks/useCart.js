import { useContext } from 'react';
import { CartContext } from '../contexts/CartContextInit';

export function useCart() {
  return useContext(CartContext);
}
