import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext/hooks';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line no-unused-vars
import { motion as m, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Styles
const formStyles = {
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
  error: "text-red-600 text-sm mt-1",
  button: {
    primary: "w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors",
    secondary: "w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
  }
};

// Add these styles to the global scope
const styles = document.createElement('style');
styles.textContent = `
  .form-label { ${formStyles.label} }
  .form-input { ${formStyles.input} }
  .form-error { ${formStyles.error} }
  .btn-primary { ${formStyles.button.primary} }
  .btn-secondary { ${formStyles.button.secondary} }
`;
document.head.appendChild(styles);

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  // Fetch addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser) {
        try {
          const { fetchUserAddresses } = await import('../services/users');
          const userAddresses = await fetchUserAddresses(currentUser.uid);
          
          if (userAddresses && userAddresses.length > 0) {
            // Transform addresses to ensure they have proper structure
            const formattedAddresses = userAddresses.map(addr => ({
              id: addr.id || String(Date.now()), // Fallback ID if none exists
              name: addr.name,
              phone: addr.phone,
              street: addr.street,
              city: addr.city,
              state: addr.state,
              zipCode: addr.zipCode
            }));
            
            setAddresses(formattedAddresses);
            setSelectedAddress(formattedAddresses[0].id);
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
          toast.error('Failed to load addresses');
        }
      }
    };

    fetchAddresses();
  }, [currentUser]);const handlePayment = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Validate address
      const selectedAddressDetails = addresses.find(addr => addr.id === selectedAddress);
      if (!selectedAddressDetails) {
        toast.error('Please select a valid delivery address');
        setLoading(false);
        return;
      }

      // Validate cart items
      if (!cartItems.length) {
        toast.error('Your cart is empty');
        setLoading(false);
        return;
      }

      // Validate user
      if (!currentUser?.uid) {
        toast.error('Please sign in to complete your order');
        setLoading(false);
        navigate('/login');
        return;
      }      // Create a clean address object for the admin-app order, omitting the id
      const addressForOrder = {
        name: String(selectedAddressDetails.name || ''),
        phone: String(selectedAddressDetails.phone || ''),
        street: String(selectedAddressDetails.street || ''),
        city: String(selectedAddressDetails.city || ''),
        state: String(selectedAddressDetails.state || ''),
        zipCode: String(selectedAddressDetails.zipCode || '')
      };
      
      // Simulate payment processing (UPI)
      toast.info('Processing payment...');
      await new Promise(resolve => setTimeout(resolve, 2000));
        // Create the order with validated data
      const { createOrder } = await import('../services/orders');
      const orderResult = await createOrder(
        currentUser.uid,
        cartItems.map(item => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity)
        })),
        Number(total),
        addressForOrder,
        'UPI'
      );
      
      console.log('Order created:', orderResult);
      
      clearCart();      toast.success('Payment successful! Redirecting to order confirmation...');
      
      setTimeout(() => {
        navigate(`/order-success/${orderResult.orderId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error processing order:', err);
      toast.error('Failed to process your order. Please try again.');
      setErrorMessage('Failed to process your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Address submit handler
  const onAddressSubmit = async (data) => {
    try {
      // Import the user service functions
      const userService = await import('../services/users');
        // Create the address in user-app's Firestore
      const newAddress = {
        name: data.name,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        userId: currentUser.uid // Add user reference
      };
        // Store in user-app's Firestore (this will generate a unique ID)
      const addressRef = await userService.addUserAddress(currentUser.uid, newAddress);
      
      console.log('Address saved with reference:', addressRef);
      
      // Add the Firestore document ID for local reference only
      const addressWithId = {
        ...newAddress,
        id: addressRef.id
      };
      
      console.log('Using address with ID:', addressWithId);
      
      setAddresses(prevAddresses => [...prevAddresses, addressWithId]);
      setSelectedAddress(addressRef.id);
      setAddingNewAddress(false);
      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold">Checkout</h1>
      </m.div>
      
      <AnimatePresence>
        {errorMessage && (
          <m.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {errorMessage}
          </m.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <AnimatePresence mode="wait">
            {!paymentStep ? (
              <m.div
                key="address-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>
                
                {addresses.length > 0 && !addingNewAddress && (
                  <div className="mb-6">
                    <div className="space-y-4">
                      {addresses.map(address => (
                        <div 
                          key={address.id}
                          className={`border rounded-md p-4 cursor-pointer ${
                            selectedAddress === address.id ? 'border-red-600 bg-red-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="flex items-start">
                            <input 
                              type="radio" 
                              checked={selectedAddress === address.id}
                              onChange={() => setSelectedAddress(address.id)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <p className="font-medium">{address.name}</p>
                              <p className="text-sm text-gray-600">{address.street}</p>
                              <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                              <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setAddingNewAddress(true)}
                      className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      + Add a new address
                    </button>
                  </div>
                )}
                
                {(addresses.length === 0 || addingNewAddress) && (
                  <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          className="form-input"
                          {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && (
                          <p className="form-error">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          id="phone"
                          type="tel"
                          className="form-input"
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: 'Invalid phone number. Must be 10 digits'
                            }
                          })}
                        />
                        {errors.phone && (
                          <p className="form-error">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="street" className="form-label">Street Address</label>
                      <input
                        id="street"
                        type="text"
                        className="form-input"
                        {...register('street', { required: 'Street address is required' })}
                      />
                      {errors.street && (
                        <p className="form-error">{errors.street.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          id="city"
                          type="text"
                          className="form-input"
                          {...register('city', { required: 'City is required' })}
                        />
                        {errors.city && (
                          <p className="form-error">{errors.city.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="form-label">State</label>
                        <input
                          id="state"
                          type="text"
                          className="form-input"
                          {...register('state', { required: 'State is required' })}
                        />
                        {errors.state && (
                          <p className="form-error">{errors.state.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                        <input
                          id="zipCode"
                          type="text"
                          className="form-input"
                          {...register('zipCode', { 
                            required: 'ZIP code is required',
                            pattern: {
                              value: /^[0-9]{6}$/,
                              message: 'Invalid ZIP code. Must be 6 digits'
                            }
                          })}
                        />
                        {errors.zipCode && (
                          <p className="form-error">{errors.zipCode.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      {addingNewAddress && (
                        <button
                          type="button"
                          onClick={() => setAddingNewAddress(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
                
                {addresses.length > 0 && !addingNewAddress && (
                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentStep(true)}
                    className="btn-primary w-full mt-6"
                  >
                    Proceed to Payment
                  </m.button>
                )}
              </m.div>
            ) : (
              // Payment UI
              <m.div
                key="payment-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
                
                <div className="space-y-4">
                  <m.div 
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-md p-4 flex items-center cursor-pointer hover:bg-gray-50"
                  >
                    <input 
                      type="radio" 
                      id="upi" 
                      name="paymentMethod" 
                      defaultChecked
                      className="mr-3"
                    />
                    <label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
                      <img 
                        src="/upi-logo.png" 
                        alt="UPI" 
                        className="w-10 h-10 mr-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png';
                        }}
                      />
                      <span>UPI Payment</span>
                    </label>
                  </m.div>

                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={loading}
                    className={`btn-primary w-full ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      'Complete Payment'
                    )}
                  </m.button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <m.div 
          className="md:w-1/3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="border-b pb-4 mb-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <m.div 
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between py-2"                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
            
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between">
                <p>Delivery Fee</p>
                <p>₹40.00</p>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <p>Total</p>
                <p>₹{(total + 40).toFixed(2)}</p>
              </div>
            </m.div>
          </div>
        </m.div>
      </div>
    </div>
  );
};

export default Checkout;
