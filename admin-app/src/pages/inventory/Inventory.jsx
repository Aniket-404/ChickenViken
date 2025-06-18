import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'inStock', 'outOfStock', 'lowStock'
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [stockAmount, setStockAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inventory data (which is the products collection)
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const inventoryQuery = query(collection(db, 'products'), orderBy('name'));
        const snapshot = await getDocs(inventoryQuery);
        
        const inventoryData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          stockQuantity: doc.data().stockQuantity || 0
        }));
        
        setInventory(inventoryData);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter and search inventory
  const filteredInventory = inventory.filter(item => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    if (filter === 'all') return matchesSearch;
    if (filter === 'inStock') return matchesSearch && item.inStock === true;
    if (filter === 'outOfStock') return matchesSearch && item.inStock === false;
    if (filter === 'lowStock') return matchesSearch && item.stockQuantity < 10 && item.inStock !== false;
    
    return matchesSearch;
  });

  // Handle stock update
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (isSubmitting || !currentItem) return;
    
    try {
      setIsSubmitting(true);
      
      const quantity = parseInt(stockAmount);
      if (isNaN(quantity)) {
        throw new Error('Please enter a valid number');
      }
      
      // Update the product in Firestore
      await updateDoc(doc(db, 'products', currentItem.id), {
        stockQuantity: quantity,
        inStock: quantity > 0,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setInventory(inventory.map(item => 
        item.id === currentItem.id 
          ? { ...item, stockQuantity: quantity, inStock: quantity > 0 } 
          : item
      ));
      
      // Close modal and reset
      setIsEditModalOpen(false);
      setCurrentItem(null);
      setStockAmount('');
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err.message || 'Failed to update stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditStock = (item) => {
    setCurrentItem(item);
    setStockAmount(item.stockQuantity.toString());
    setIsEditModalOpen(true);
  };

  // Get status badge class
  const getStatusBadge = (item) => {
    if (item.inStock === false) {
      return 'bg-red-100 text-red-800';
    }
    if (item.stockQuantity < 10) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Get status text
  const getStatusText = (item) => {
    if (item.inStock === false) {
      return 'Out of Stock';
    }
    if (item.stockQuantity < 10) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('inStock')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'inStock'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setFilter('lowStock')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'lowStock'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter('outOfStock')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'outOfStock'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Out of Stock
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=N/A';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stockQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item)}`}>
                        {getStatusText(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditStock(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {isEditModalOpen && currentItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Update Stock Quantity
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="px-6 py-4">
                {error && (
                  <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Product:</span> {currentItem.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Current Stock:</span> {currentItem.stockQuantity}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-medium">Status:</span> {getStatusText(currentItem)}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="stockAmount" className="block text-sm font-medium text-gray-700">
                    New Stock Quantity*
                  </label>
                  <input
                    type="number"
                    id="stockAmount"
                    value={stockAmount}
                    onChange={(e) => setStockAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
