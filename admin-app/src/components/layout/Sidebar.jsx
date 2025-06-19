import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/index.js';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Icons
const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm9.293 10.707a1 1 0 001.414-1.414L12.414 11H15a1 1 0 100-2h-2.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3z" clipRule="evenodd" />
  </svg>
);

const Sidebar = () => {
  const { logout, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminDetails, setAdminDetails] = useState({ displayName: '', role: 'Admin' });

  // Fetch admin details
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (currentUser?.uid) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setAdminDetails({
              displayName: data.displayName || 'Admin User',
              role: data.role || 'Admin'
            });
          }
        } catch (error) {
          console.error('Error fetching admin details:', error);
        }
      }
    };
    fetchAdminDetails();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  const menuItems = [
    { to: '/orders', name: 'Orders', icon: <OrdersIcon /> },
    { to: '/products', name: 'Products', icon: <ProductsIcon /> },
    { to: '/inventory', name: 'Inventory', icon: <InventoryIcon /> },
    { to: '/users', name: 'Users', icon: <UsersIcon /> },
    { to: '/settings', name: 'Settings', icon: <SettingsIcon /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center">
        <div className="font-bold text-xl text-blue-600">ChickenViken Admin</div>
        <button 
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="relative w-3/4 max-w-xs bg-white h-full shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xl text-blue-600">ChickenViken Admin</div>
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-8">
              <div className="border-b pb-2 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{adminDetails.displayName}</div>
                    <div className="text-sm text-gray-600">{adminDetails.role}</div>
                  </div>
                </div>
              </div>
              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={toggleMobileMenu}
                        className={({ isActive }) => 
                          `flex items-center p-3 rounded-md ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <span className="mr-4">{item.icon}</span>
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <span className="mr-4"><LogoutIcon /></span>
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div 
          className="opacity-50 fixed inset-0 z-10 bg-black"
          onClick={toggleMobileMenu}
        ></div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 px-4 flex items-center">
              <h1 className="font-bold text-xl text-blue-600">ChickenViken Admin</h1>
            </div>
            <div className="mt-8 px-4">
              <div className="border-b pb-2 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 truncate max-w-[144px]">{adminDetails.displayName}</div>
                    <div className="text-sm text-gray-600">{adminDetails.role}</div>
                  </div>
                </div>
              </div>
              <nav className="mt-5">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center p-3 rounded-md ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <span className="mr-4">{item.icon}</span>
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                  <li className="mt-8">
                    <button
                      onClick={handleLogout}
                      className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <span className="mr-4"><LogoutIcon /></span>
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
