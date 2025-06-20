import { useState, useEffect } from 'react';
import { Sidebar } from './SidebarNew';

// Basic dashboard stats component
const StatsCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <span className="material-icons text-white">{icon}</span>
      </div>
    </div>
  </div>
);

export function Dashboard() {
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, delivered: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, this would fetch real data from Firestore
        // For now, we'll use placeholder data
        setOrderStats({ total: 145, pending: 23, delivered: 122 });
        setTopProducts([
          { name: 'Chicken Breast', value: 4800 },
          { name: 'Whole Chicken', value: 3500 },
          { name: 'Chicken Legs', value: 2900 }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-60 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Revenue" 
              value={`₹${(Math.random() * 100000).toFixed(0).toLocaleString()}`} 
              icon="payments" 
              color="bg-blue-500"
            />
            <StatsCard 
              title="Total Orders" 
              value={orderStats.total} 
              icon="shopping_cart" 
              color="bg-green-500"
            />
            <StatsCard 
              title="Pending Orders" 
              value={orderStats.pending} 
              icon="pending" 
              color="bg-yellow-500"
            />
            <StatsCard 
              title="Delivered Orders" 
              value={orderStats.delivered} 
              icon="local_shipping" 
              color="bg-purple-500"
            />
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="w-full h-16 border-b border-gray-200">
                  <th className="text-left pl-4">Order ID</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="h-16 border-b border-gray-200">
                    <td className="pl-4">#ORD-{Math.floor(Math.random() * 10000)}</td>
                    <td>Customer {i + 1}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        i % 3 === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        i % 3 === 1 ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Delivered' : 'Processing'}
                      </span>
                    </td>
                    <td>₹{(Math.random() * 1000).toFixed(2)}</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                  <span className="material-icons text-gray-600">dining</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(product.value / 5000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-bold">₹{product.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Also include a default export for backward compatibility
export default Dashboard;
