import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext/index.js';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // App settings
  const [settings, setSettings] = useState({
    storeName: 'ChickenViken',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    taxRate: '7.5',
    enableOrdering: true,
    enablePayments: true,
    orderNotifications: true,
    allowGuestCheckout: true,
    maintenanceMode: false
  });
  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settingsDoc = await getDoc(doc(db, 'settings', 'appSettings'));
        
        if (settingsDoc.exists()) {
          // Use functional update to avoid dependency on settings
          setSettings(currentSettings => ({
            ...currentSettings,
            ...settingsDoc.data()
          }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate tax rate
      const taxRate = parseFloat(settings.taxRate);
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        throw new Error('Tax rate must be a number between 0 and 100');
      }
      
      // Update settings in Firestore
      await updateDoc(doc(db, 'settings', 'appSettings'), {
        ...settings,
        taxRate: taxRate.toString(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'unknown'
      });
      
      setSuccess('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-standard mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-standard mb-4">
          {success}
        </div>
      )}
        <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Store Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Store Information</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="storeName" className="form-label">
                Store Name
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={settings.storeName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="storeEmail" className="form-label">
                Store Email
              </label>
              <input
                type="email"
                id="storeEmail"
                name="storeEmail"
                value={settings.storeEmail}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="storePhone" className="form-label">
                Store Phone
              </label>
              <input
                type="text"
                id="storePhone"
                name="storePhone"
                value={settings.storePhone}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="storeAddress" className="form-label">
                Store Address
              </label>
              <textarea
                id="storeAddress"
                name="storeAddress"
                rows="3"
                value={settings.storeAddress}
                onChange={handleInputChange}
                className="form-input"
              ></textarea>
            </div>
          </div>
          
          {/* Tax & Pricing */}
          <div className="px-6 py-4 border-t border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Tax & Pricing</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="taxRate" className="form-label">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the tax rate as a percentage (e.g., 7.5 for 7.5% tax).
              </p>
            </div>
          </div>
          
          {/* Store Features */}
          <div className="px-6 py-4 border-t border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Store Features</h2>
          </div>
          <div className="px-6 py-4 space-y-4">            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableOrdering"
                name="enableOrdering"
                checked={settings.enableOrdering}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="enableOrdering" className="ml-2 block text-sm text-gray-900">
                Enable Online Ordering
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enablePayments"
                name="enablePayments"
                checked={settings.enablePayments}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="enablePayments" className="ml-2 block text-sm text-gray-900">
                Enable Online Payments
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="orderNotifications"
                name="orderNotifications"
                checked={settings.orderNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="orderNotifications" className="ml-2 block text-sm text-gray-900">
                Enable Order Notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowGuestCheckout"
                name="allowGuestCheckout"
                checked={settings.allowGuestCheckout}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="allowGuestCheckout" className="ml-2 block text-sm text-gray-900">
                Allow Guest Checkout
              </label>
            </div>
          </div>
          
          {/* Maintenance Mode */}
          <div className="px-6 py-4 border-t border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Maintenance Mode</h2>
          </div>          <div className="px-6 py-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                Enable Maintenance Mode
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, the store will be temporarily unavailable to customers.
            </p>
          </div>
            {/* Submit Button */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`btn-primary ${
                saving
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
