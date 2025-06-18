import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useForm } from 'react-hook-form';
import { checkFirebaseStatus } from '../firebase/firebaseStatus';
import FirebaseCredentialsTest from '../components/FirebaseCredentialsTest';

// Show credential test component in development mode only
const isDevelopment = import.meta.env.DEV || true; // Force true for testing

const AdminLogin = () => {
  const { login, signup } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState({ isChecking: true, isAvailable: true, message: '' });
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Check Firebase availability when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      setFirebaseStatus({ isChecking: true, isAvailable: true, message: '' });
      try {
        const status = await checkFirebaseStatus();
        setFirebaseStatus({ 
          isChecking: false, 
          isAvailable: status.isAvailable, 
          message: status.message 
        });
        
        if (!status.isAvailable) {
          setError(status.message);
        }
      } catch (err) {
        setFirebaseStatus({ 
          isChecking: false, 
          isAvailable: false, 
          message: `Failed to check Firebase status: ${err.message}` 
        });
        setError('Unable to connect to authentication service. Please try again later.');
      }
    };
    
    checkStatus();
  }, []);
  const onSubmit = async (data) => {
    if (loading) return;
    
    // Don't attempt login if Firebase is unavailable
    if (!firebaseStatus.isAvailable && !firebaseStatus.isChecking) {
      setError('Authentication service is currently unavailable. Please try again later.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const email = data.email?.trim();
      const password = data.password?.trim();
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (isSignup) {        // Handle signup
        const displayName = data.displayName?.trim();
        if (!displayName) {
          throw new Error('Display name is required');
        }
        
        await signup(email, password, displayName);
      } else {
        // Handle login
        await login(email, password);
      }
      
      // If we reach here, login/signup was successful
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      
      // Don't overwrite more specific error messages from the context
      if (!error) {
        if (err.code === 'auth/network-request-failed') {
          setError('Network connection issue. Please check your internet connection and try again.');
        } else if (err.code?.includes('visibility-check') || err.message?.includes('visibility-check')) {
          setError('Firebase service is temporarily unavailable. Please try again in a few moments.');
        } else {
          setError(err.message || 'Authentication failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? 'Create Admin Account' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignup 
              ? 'Sign up to manage ChickenViken' 
              : 'Sign in to access the admin dashboard'}
          </p>
          
          {firebaseStatus.isChecking && (
            <div className="mt-2 text-center text-sm text-blue-600">
              Checking authentication service availability...
            </div>
          )}
          
          {!firebaseStatus.isChecking && !firebaseStatus.isAvailable && (
            <div className="mt-2 text-center text-sm text-orange-600">
              ⚠️ Authentication service may be experiencing issues
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-md space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  {...register('displayName', { 
                    required: 'Display name is required'
                  })}
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Processing...' : (isSignup ? 'Sign up' : 'Sign in')}
            </button>
            
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
        
        {/* Firebase Credentials Test in Development Mode */}
        {isDevelopment && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <FirebaseCredentialsTest />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
