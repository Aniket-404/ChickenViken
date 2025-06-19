import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, userDb } from '../../firebase/config';
import { formatCurrency } from '../../utils/currency';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    popularProducts: []
  });

  useEffect(() => {    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        // Initialize default values
        let totalOrders = 0;
        let recentOrders = [];
        let totalProducts = 0;
        let popularProducts = [];
        let totalUsers = 0;
        let todayRevenue = 0;
        
        try {
          // Get total orders from userDb (user-app Firestore)
          const ordersSnapshot = await getDocs(collection(userDb, 'orders'));
          totalOrders = ordersSnapshot.size;
          console.log(`Found ${totalOrders} orders`);
          
          // Get recent orders (last 5) from userDb
          const recentOrdersQuery = query(
            collection(userDb, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
          recentOrders = recentOrdersSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
              id: doc.id, 
              ...data,
              total: data.finalAmount || data.totalAmount || 0,
              customerName: data.address?.name || data.customerName || 'N/A',
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate()?.toLocaleDateString() || 'N/A'
            };
          });
          
          // Calculate today's revenue from completed orders only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          ordersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const orderDate = data.createdAt?.toDate();
            const status = data.status?.toLowerCase() || '';
            
            if (orderDate && orderDate >= today && status === 'completed') {
              todayRevenue += data.finalAmount || data.totalAmount || 0;
            }
          });
        } catch (error) {
          console.error('Error fetching orders data:', error);
        }
        
        try {
          // Get total products from db (admin-app Firestore)
          const productsSnapshot = await getDocs(collection(db, 'products'));
          totalProducts = productsSnapshot.size;
          console.log(`Found ${totalProducts} products`);
          
          // Get popular products from db (admin-app Firestore)
          try {
            const popularProductsQuery = query(
              collection(db, 'products'),
              orderBy('orderCount', 'desc'),
              limit(5)
            );
            const popularProductsSnapshot = await getDocs(popularProductsQuery);
            popularProducts = popularProductsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
          } catch (error) {
            console.warn('Error fetching popular products (orderCount field may not exist):', error);
            // Fallback: just get the first 5 products without sorting
            const fallbackQuery = query(collection(db, 'products'), limit(5));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            popularProducts = fallbackSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
          }
        } catch (error) {
          console.error('Error fetching products data:', error);
        }
        
        try {
          // Get total users from userDb (user-app Firestore)
          const usersSnapshot = await getDocs(collection(userDb, 'users'));
          totalUsers = usersSnapshot.size;
          console.log(`Found ${totalUsers} users`);
        } catch (error) {
          console.error('Error fetching users data:', error);
        }        setStats({
          totalOrders,
          totalProducts,
          totalUsers,
          recentOrders,
          popularProducts,
          todayRevenue
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Revenue (Today)</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(stats.todayRevenue || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Orders</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Products</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Users</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
        </div>
      </div>
      
      {/* Recent Orders Table - Full Width */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.customerName || order.address?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.total || order.finalAmount || order.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
