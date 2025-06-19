// Footer.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, adminDb } from '../firebase/config';

const Footer = () => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'ChickenViken',
    storeEmail: 'info@chickenviken.com',
    storePhone: '(555) 123-4567',
    storeAddress: '123 Chicken St, Food City',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        
        // First try to fetch from the public collection in the user's database
        const publicSettingsRef = doc(db, 'publicSettings', 'storeInfo');
        const publicSettingsDoc = await getDoc(publicSettingsRef);
        
        if (publicSettingsDoc.exists()) {
          const data = publicSettingsDoc.data();
          setStoreInfo(prevState => ({
            ...prevState,
            ...data,
          }));
          setLoading(false);
          return;
        }
        
        // If public settings don't exist, try from admin database as fallback
        try {
          const settingsDocRef = doc(adminDb, 'settings', 'appSettings');
          const settingsDoc = await getDoc(settingsDocRef);
          
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setStoreInfo(prevState => ({
              ...prevState,
              storeName: data.storeName || prevState.storeName,
              storeEmail: data.storeEmail || prevState.storeEmail,
              storePhone: data.storePhone || prevState.storePhone,
              storeAddress: data.storeAddress || prevState.storeAddress,
            }));
          }
        } catch {
          console.log('Fallback to admin DB failed, using default values');
          // Silently fail and use default values
        }
      } catch (err) {
        console.error('Error fetching store information:', err);
        // No need to set error state - we'll use default values
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  const FooterContent = React.memo(() => (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-primary mb-4">Contact Us</h3>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-56 mb-2"></div>
            </div>
          ) : (
            <div className="space-y-2 text-center">
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
  ));

  return <FooterContent />;
};

export { Footer as default };
