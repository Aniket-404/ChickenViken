import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextInit';

export function useAuth() {
  return useContext(AuthContext);
}
