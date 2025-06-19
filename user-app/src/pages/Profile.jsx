import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    addresses: []
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''  });  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    pincode: '', // Adding this to handle both zipCode and pincode
    type: 'home'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Current user ID:', currentUser.uid);

        // Fallback to create a local profile when Firestore isn't accessible
        // This lets the app work even if Firestore permissions aren't set up yet
        const fallbackUserData = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: '',
          addresses: [],
          createdAt: new Date()
        };        try {
          // Try to fetch from Firestore first
          const { fetchUserData: fetchUser, createOrUpdateUser } = await import('../services/users');
          console.log('About to fetch user data for:', currentUser.uid);
          const userData = await fetchUser(currentUser.uid);
          console.log('User data fetched:', userData);

          if (userData) {
            // User document exists
            setUserData({
              name: userData.name || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || '',
              addresses: userData.addresses || []
            });
            setFormData({
              name: userData.name || '',
              phone: userData.phone || ''
            });
          } else {
            // If user document doesn't exist, create it
            console.log('User document not found, creating profile document');
            
            try {
              // Create a new user document
              await createOrUpdateUser(currentUser.uid, {
                ...fallbackUserData,
                createdAt: new Date()
              });
              
              console.log('User profile document created successfully');
              
              // Set the data in state
              setUserData(fallbackUserData);
              setFormData({
                name: fallbackUserData.name,
                phone: fallbackUserData.phone
              });
            } catch (createErr) {
              console.error('Error creating user document:', createErr);
              // Fall back to local data
              setUserData(fallbackUserData);
              setFormData({
                name: fallbackUserData.name,
                phone: fallbackUserData.phone
              });
              setError('Could not create profile document. Using local data only.');
            }
          }
        } catch (firestoreErr) {
          // If Firestore access fails, use fallback data
          console.error('Error accessing Firestore:', firestoreErr);
          console.log('Using fallback profile data from auth');
          
          setUserData(fallbackUserData);
          setFormData({
            name: fallbackUserData.name,
            phone: fallbackUserData.phone
          });
          
          setError('Profile is in limited mode. Firebase permissions need to be set up.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      try {
        setOrdersLoading(true);
        setOrderError(null);
        
        console.log('Fetching orders for user:', currentUser.uid);
        const { fetchUserOrders } = await import('../services/orders');
        const userOrders = await fetchUserOrders(currentUser.uid);
        
        console.log('Fetched user orders:', userOrders);
        console.log('Number of orders found:', userOrders.length);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        
        // Provide more specific error messages
        if (err.code === 'permission-denied') {
          setOrderError('You don\'t have permission to access your orders. Please contact support.');
        } else if (err.code === 'failed-precondition') {
          setOrderError('Unable to fetch orders. Firebase index may be missing. Please contact support.');
        } else if (err.code === 'unavailable') {
          setOrderError('Order service is temporarily unavailable. Please try again later.');
        } else {
          setOrderError('Failed to load order history. Please try again later.');
        }
        
        // Clear orders to avoid showing empty state message
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]);

  // Function to handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      
      const { cancelOrder } = await import('../services/orders');
      await cancelOrder(orderId);
      
      // Update the local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'canceled' } 
            : order
        )
      );
      
      toast.success('Order canceled successfully');
    } catch (err) {
      console.error('Error canceling order:', err);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    console.log(`Address field changed: ${name} = ${value}`);
    setNewAddress(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('New address state:', updated);
      return updated;
    });
  };const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update local state regardless of Firestore access
      setUserData(prev => ({
        ...prev,
        name: formData.name,
        phone: formData.phone
      }));

      try {
        // Try to update Firestore using the improved function that handles new documents
        const { createOrUpdateUser } = await import('../services/users');
        await createOrUpdateUser(currentUser.uid, {
          name: formData.name,
          phone: formData.phone,
          email: userData.email || currentUser.email
        });
      } catch (firestoreErr) {
        console.error('Error updating Firestore:', firestoreErr);
        setError('Profile updated locally only. Changes will not persist between sessions.');
      }

      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const handleAddAddress = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate address
      if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
        setError('Please fill in all address fields');
        setLoading(false);
        return;
      }

      const updatedAddresses = [...userData.addresses, newAddress];
      
      // Update local state regardless of Firestore access
      setUserData(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));

      try {
        // Try to update Firestore using the improved function that handles new documents
        const { createOrUpdateUser } = await import('../services/users');
        await createOrUpdateUser(currentUser.uid, {
          addresses: updatedAddresses,
          name: userData.name,
          phone: userData.phone,
          email: userData.email || currentUser.email
        });
      } catch (firestoreErr) {
        console.error('Error updating Firestore addresses:', firestoreErr);
        setError('Address added locally only. Changes will not persist between sessions.');
      }      setAddingAddress(false);
      setNewAddress({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'home'
      });
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleEditAddress = (index) => {
    // Get the address to edit
    const addressToEdit = userData.addresses[index];
    
    // Ensure all fields are defined with fallbacks to empty strings
    setNewAddress({
      name: addressToEdit.name || '',
      phone: addressToEdit.phone || '',
      street: addressToEdit.street || '',
      city: addressToEdit.city || '',
      state: addressToEdit.state || '',
      zipCode: addressToEdit.zipCode || addressToEdit.pincode || '',
      pincode: addressToEdit.pincode || addressToEdit.zipCode || '',
      type: addressToEdit.type || 'home'
    });
    
    setEditingAddressIndex(index);
    setAddingAddress(true);
    
    // Log for debugging
    console.log('Editing address:', addressToEdit);
  };
  const handleUpdateAddress = async () => {
    try {
      console.log('handleUpdateAddress called', { newAddress, editingAddressIndex });
      setLoading(true);
      setError(null);

      // Validate address
      if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
        setError('Please fill in all address fields');
        setLoading(false);
        return;
      }

      // Create a copy of the addresses array
      const updatedAddresses = [...userData.addresses];
      
      // Update the address at the specified index
      updatedAddresses[editingAddressIndex] = {
        ...newAddress,
        // Ensure both zipCode and pincode are saved to handle different field names
        zipCode: newAddress.zipCode || newAddress.pincode,
        pincode: newAddress.pincode || newAddress.zipCode
      };
      
      console.log('Updated addresses:', updatedAddresses);
      
      // Update local state regardless of Firestore access
      setUserData(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));

      try {
        // Try to update Firestore
        const { createOrUpdateUser } = await import('../services/users');
        await createOrUpdateUser(currentUser.uid, {
          addresses: updatedAddresses,
          name: userData.name,
          phone: userData.phone,
          email: userData.email || currentUser.email
        });
      } catch (firestoreErr) {
        console.error('Error updating Firestore addresses:', firestoreErr);
        setError('Address updated locally only. Changes will not persist between sessions.');
      }      // Reset the form
      setAddingAddress(false);
      setEditingAddressIndex(null);
      setNewAddress({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        pincode: '',
        type: 'home'
      });
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    }
  };  const handleRemoveAddress = async (index) => {
    try {
      setLoading(true);
      setError(null);

      const updatedAddresses = userData.addresses.filter((_, i) => i !== index);
      
      // Update local state regardless of Firestore access
      setUserData(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));

      try {
        // Try to update Firestore using the improved function that handles new documents
        const { createOrUpdateUser } = await import('../services/users');
        await createOrUpdateUser(currentUser.uid, {
          addresses: updatedAddresses,
          name: userData.name,
          phone: userData.phone,
          email: userData.email || currentUser.email
        });
      } catch (firestoreErr) {
        console.error('Error updating Firestore addresses:', firestoreErr);
        setError('Address removed locally only. Changes will not persist between sessions.');
      }
    } catch (err) {
      console.error('Error removing address:', err);
      setError('Failed to remove address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add a test button in the UI
  if (loading && !userData.email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {error.includes('Firebase permissions') && (
            <div className="mt-2">
              <p className="font-semibold">Important:</p>
              <p>The app administrator needs to deploy Firebase security rules to fix this issue.</p>
              <p className="text-sm mt-1">See the FIREBASE_DEBUG.md file for instructions.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className="text-red-600 hover:text-red-800"
              >
                Edit
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: userData.name,
                      phone: userData.phone
                    });
                  }}
                  className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p>{userData.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p>{userData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p>{userData.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Addresses</h2>
            {!addingAddress && (
              <button 
                onClick={() => setAddingAddress(true)}
                className="text-red-600 hover:text-red-800"
              >
                Add New Address
              </button>
            )}
          </div>
          
          {addingAddress ? (
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-medium">{editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text"                    name="name"
                    value={newAddress.name || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="text"                    name="phone"
                    value={newAddress.phone || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Street Address</label>
                  <input 
                    type="text"                    name="street"
                    value={newAddress.street || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input 
                    type="text"                    name="city"
                    value={newAddress.city || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">State</label>
                  <input 
                    type="text"                    name="state"
                    value={newAddress.state || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>                  <label className="block text-gray-700 mb-2">Zip Code</label>
                  <input 
                    type="text"
                    name="zipCode"
                    value={newAddress.zipCode || ''}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Address Type</label>
                  <select                    name="type"
                    value={newAddress.type || 'home'}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                {editingAddressIndex !== null ? (
                  <button 
                    onClick={handleUpdateAddress}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <button 
                    onClick={handleAddAddress}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Address'}
                  </button>
                )}
                <button                  onClick={() => {
                    setAddingAddress(false);
                    setEditingAddressIndex(null);
                    setNewAddress({
                      name: '',
                      phone: '',
                      street: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      pincode: '',
                      type: 'home'
                    });
                  }}
                  className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {userData.addresses && userData.addresses.length > 0 ? (
                <div className="space-y-4">
                  {userData.addresses.map((address, index) => (                    <div key={index} className="border p-4 rounded-md relative hover:shadow-md transition-all">
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button 
                          onClick={() => handleEditAddress(index)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          aria-label="Edit address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleRemoveAddress(index)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Delete address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="capitalize mb-2 font-medium text-red-600">
                        {address.type} Address
                      </div>
                      <div className="pt-2">
                        {address.name && <p className="font-semibold">{address.name}</p>}
                        {address.phone && <p className="mb-1 text-gray-700">{address.phone}</p>}
                        <p className="text-gray-800">{address.street}</p>
                        <p className="text-gray-800">{address.city}, {address.state} {address.zipCode || address.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You don't have any saved addresses yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>      
      {/* My Orders Section */}      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Orders</h2>
            {orderError && (              <button 
                onClick={async () => {
                  try {
                    setOrdersLoading(true);
                    setOrderError(null);
                    
                    console.log('Retrying order fetch for user:', currentUser.uid);
                    const { fetchUserOrders } = await import('../services/orders');
                    const userOrders = await fetchUserOrders(currentUser.uid);
                    
                    console.log('Re-fetched user orders:', userOrders);
                    console.log('Number of orders found:', userOrders.length);
                    setOrders(userOrders);
                  } catch (err) {
                    console.error('Error re-fetching orders:', err);
                    
                    // Provide more specific error messages
                    if (err.code === 'permission-denied') {
                      setOrderError('You don\'t have permission to access your orders. Please contact support.');
                    } else if (err.code === 'failed-precondition') {
                      setOrderError('Unable to fetch orders. Firebase index may be missing. Please contact support.');
                    } else if (err.code === 'unavailable') {
                      setOrderError('Order service is temporarily unavailable. Please try again later.');
                    } else {
                      setOrderError('Failed to load order history. Please try again later.');
                    }
                    
                    setOrders([]);
                  } finally {
                    setOrdersLoading(false);
                  }
                }}
                className="text-red-600 hover:text-red-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try Again
              </button>
            )}
          </div>
          
          {orderError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Error Loading Orders</p>
              <p>{orderError}</p>
            </div>
          )}
          
          {ordersLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : !orderError && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div>
                      <span className="font-medium">Order ID: </span>
                      <span>{order.orderId}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'canceled' || order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Items</h3>
                      <div className="space-y-2">
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div className="flex items-center">
                                {item.imageUrl && (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name || 'Product'}
                                    className="w-12 h-12 object-cover rounded mr-3"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{item.name || 'Unknown Product'}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                                </div>
                              </div>
                              <p>₹{(item.price || 0).toFixed(2)}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No items information available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 mb-3">                      <div className="flex justify-between mb-1">
                        <span>Subtotal</span>
                        <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Delivery Fee</span>
                        <span>₹{(order.deliveryFee || 40).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{(order.finalAmount || (order.totalAmount || 0) + 40).toFixed(2)}</span>
                      </div>
                    </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                      <div>
                        {order.address ? (
                          <p className="text-sm">
                            <span className="font-medium">Delivery Address:</span> {' '}
                            {order.address.name || ''}, {order.address.street || ''}, {order.address.city || ''}, {order.address.state || ''} {order.address.zipCode || order.address.pincode || ''}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">Delivery address not available</p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Payment:</span> {order.paymentMethod || 'Not specified'}
                        </p>
                      </div>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={loading}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {loading ? 'Canceling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>              ))}
            </div>
          ) : !orderError ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-1">No Orders Yet</p>
              <p className="text-gray-400">You haven't placed any orders yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button 
          onClick={handleLogout}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
