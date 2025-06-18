import { createContext } from 'react';

// Create the Admin Auth context with default values
export const AdminAuthContext = createContext({
  currentAdmin: null,
  loading: true,
  error: '',
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  getAdminData: async () => {}
});
