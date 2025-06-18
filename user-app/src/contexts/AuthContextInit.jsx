import { createContext } from 'react';

// Create the Auth context with default values
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  error: '',
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  getUserData: async () => {}
});
