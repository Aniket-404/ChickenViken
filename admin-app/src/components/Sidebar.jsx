import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const Sidebar = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/orders', label: 'Orders', icon: 'list_alt' },
    { path: '/products', label: 'Products', icon: 'inventory' },
    { path: '/customers', label: 'Customers', icon: 'people' },
    { path: '/analytics', label: 'Analytics', icon: 'trending_up' }
  ];
  
  return (
    <motion.div 
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 80 : 240 }}
      className="bg-gray-800 text-white h-screen fixed left-0 top-0 z-10"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold"
          >
            ChickenViken
          </motion.h1>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-gray-400 hover:text-white"
        >
          <span className="material-icons">
            {collapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <span className="material-icons">{item.icon}</span>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-4"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
        <button 
          onClick={handleLogout}
          className="flex items-center hover:text-red-400 transition-colors"
        >
          <span className="material-icons">exit_to_app</span>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-4"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
