import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext/context';

export function useAuth() {
  return useContext(AuthContext);
}
