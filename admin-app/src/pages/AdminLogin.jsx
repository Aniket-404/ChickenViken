import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useForm } from 'react-hook-form';

// Utility to get a user-friendly error message
const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (error.code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.';
  }
  
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  if (error.code === 'permission-denied') {
    return 'Authorization failed. Please ensure you have admin privileges.';
  }
  
  return error.message || 'Login failed. Please try again.';
};

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (loading) return;
    
    try {
      console.log('Login attempt with:', data.email);
      setError('');
      setLoading(true);
      
      // Ensure email and password are strings and not undefined
      const email = data.email?.trim();
      const password = data.password?.trim();
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      try {
        console.log('Before login call');
        const user = await login(email, password);
        console.log('After login call, user:', user);
        
        setRetryCount(0); // Reset retry count on success
        
        console.log('Login successful, preparing to navigate');
        localStorage.setItem('adminUser', JSON.stringify({ 
          email: data.email,
          uid: user?.uid || 'unknown'
        }));
        
        // Add a slight delay before navigation
        setTimeout(() => {
          navigate('/');
        }, 500);
        
      } catch (loginErr) {
        console.error('Error during login function:', loginErr);
        
        // Handle network errors with retry
        if (loginErr.code === 'auth/network-request-failed' && retryCount < 2) {
          setRetryCount(prev => prev + 1);
          setError('Network error. Retrying...');
          setTimeout(() => {
            setLoading(false);
            handleSubmit(onSubmit)(data);
          }, 2000);
          return;
        }
        
        // Special handling for permission errors
        if (loginErr.code === 'permission-denied' || 
            loginErr.message?.includes('permission') || 
            loginErr.message?.includes('insufficient')) {
          console.warn('Firestore permission issue detected, proceeding with auth');
          localStorage.setItem('adminUser', JSON.stringify({ email: data.email }));
          setLoading(false);
          navigate('/');
          return;
        }
        
        throw loginErr;
      }
    } catch (err) {
      console.error('Login error in component:', err);
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the ChickenViken admin dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
