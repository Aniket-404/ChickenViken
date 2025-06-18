import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useForm } from 'react-hook-form';

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/products');
    }
  }, [cartItems, navigate]);
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData && userData.addresses) {
            setAddresses(userData.addresses);
            if (userData.addresses.length > 0) {
              setSelectedAddress(userData.addresses[0].id);
            }
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }
      }
    };
    
    fetchAddresses();
  }, [currentUser]);
  
  const onAddressSubmit = async (data) => {
    // Logic to add a new address
    // In a real app, this would update the user's addresses in Firestore
    const newAddress = {
      id: Date.now().toString(),
      name: data.name,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode
    };
    
    setAddresses(prevAddresses => [...prevAddresses, newAddress]);
    setSelectedAddress(newAddress.id);
    setAddingNewAddress(false);
  };
  
  const getSelectedAddressDetails = () => {
    return addresses.find(addr => addr.id === selectedAddress);
  };
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // In Phase 1, this is just a mock payment process
      // In Phase 2, this would integrate with a real payment gateway
      
      // Create the order in Firestore
      const orderData = {
        userId: currentUser.uid,
        items: cartItems,
        totalAmount: total,
        address: getSelectedAddressDetails(),
        status: 'pending',
        paymentStatus: 'paid', // In a real app, this would be set based on payment gateway response
        createdAt: serverTimestamp()
      };
      
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear the cart
      clearCart();
      
      // Navigate to success page
      navigate(`/order-success/${orderRef.id}`);
    } catch (err) {
      console.error('Error processing order:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock Payment UI inspired by BharatPe
  const renderMockPaymentUI = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">Select Payment Method</h2>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 flex items-center cursor-pointer hover:bg-gray-50">
            <input 
              type="radio" 
              id="upi" 
              name="paymentMethod" 
              checked
              readOnly
              className="mr-3"
            />
            <label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" 
                alt="UPI" 
                className="w-10 h-10 mr-2"
              />
              <span>UPI Payment</span>
            </label>
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-600">Scan QR Code to Pay</span>
            </div>
            
            <div className="bg-white p-4 mx-auto w-48 h-48 flex items-center justify-center border">
              <div className="text-center">
                <span className="text-sm text-gray-500">Mock QR Code</span>
                <div className="mt-2 grid grid-cols-5 grid-rows-5 gap-1">
                  {/* Simple mock QR code pattern */}
                  {Array(25).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Or pay using UPI ID</p>
              <div className="flex justify-center items-center">
                <input 
                  type="text" 
                  value="chickenviken@ybl" 
                  readOnly
                  className="border px-3 py-2 rounded-l-md text-sm"
                />
                <button className="bg-blue-500 text-white px-3 py-2 rounded-r-md text-sm">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            This is a mock payment interface. In the final version, this will be replaced with a real payment gateway.
          </p>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          {!paymentStep ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
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
                <div className="mt-6">
                  <button
                    onClick={() => setPaymentStep(true)}
                    className="btn-primary w-full"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          ) : (
            renderMockPaymentUI()
          )}
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="border-b pb-4 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
