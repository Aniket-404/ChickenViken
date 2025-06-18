import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
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
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };  const handleSaveProfile = async () => {
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
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
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
      }

      setAddingAddress(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home'
      });
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address. Please try again.');
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
              <h3 className="font-medium">Add New Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Street Address</label>
                  <input 
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input 
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">State</label>
                  <input 
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Pincode</label>
                  <input 
                    type="text"
                    name="pincode"
                    value={newAddress.pincode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Address Type</label>
                  <select
                    name="type"
                    value={newAddress.type}
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
                <button 
                  onClick={handleAddAddress}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
                <button 
                  onClick={() => setAddingAddress(false)}
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
                  {userData.addresses.map((address, index) => (
                    <div key={index} className="border p-4 rounded-md relative">
                      <div className="absolute top-4 right-4">
                        <button 
                          onClick={() => handleRemoveAddress(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <div className="capitalize mb-2 font-medium">
                        {address.type} Address
                      </div>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.pincode}</p>
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
      </div>        <div className="flex justify-end mt-8">
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
