import { useContext } from 'react';
import { AdminAuthContext } from '../contexts/AdminAuthContextInit';

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
