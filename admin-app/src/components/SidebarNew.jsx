import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export function Sidebar() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('adminUser');
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
    { path: '/analytics', label: 'Analytics', icon: 'trending_up' },
    { path: '/admins', label: 'Admin Management', icon: 'admin_panel_settings' }
  ];
  
  return (
    <div className={`bg-gray-800 text-white h-screen fixed left-0 top-0 z-10 transition-all duration-300 ${collapsed ? 'w-20' : 'w-60'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h1 className="text-xl font-bold">
            ChickenViken
          </h1>
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
                  <span className="ml-4">
                    {item.label}
                  </span>
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
            <span className="ml-4">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// Also include a default export for backward compatibility
export default Sidebar;
