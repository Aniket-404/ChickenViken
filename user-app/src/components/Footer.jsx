import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { adminDb } from '../firebase/config';

const Footer = () => {  const [storeInfo, setStoreInfo] = useState({
    storeName: 'ChickenViken',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const settingsDocRef = doc(adminDb, 'settings', 'appSettings');
        const settingsDoc = await getDoc(settingsDocRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();          setStoreInfo({
            storeName: data.storeName || 'ChickenViken',
            storeEmail: data.storeEmail || '',
            storePhone: data.storePhone || '',
            storeAddress: data.storeAddress || '',
          });
        }
      } catch (err) {
        console.error('Error fetching store information:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-primary mb-4">Contact Us</h3>
          {loading ? (            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-56 mb-2"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">Unable to load contact information</p>
          ) : (            <div className="space-y-2 text-center">
              {storeInfo.storePhone && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Phone:</span> {storeInfo.storePhone}
                </p>
              )}
              {storeInfo.storeEmail && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Email:</span> {storeInfo.storeEmail}
                </p>
              )}
              {storeInfo.storeAddress && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Address:</span> {storeInfo.storeAddress}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {storeInfo.storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
