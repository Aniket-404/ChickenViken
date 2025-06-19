import { useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

const Users = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading) return; // Wait for auth to initialize
      
      if (!currentUser) {
        setError('Please log in to view admin users');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get the current user's admin document (which we have permission to read)
        const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        
        if (!currentUserDoc.exists()) {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }        // Since we're an admin, we can now fetch all admin documents
        const adminsRef = collection(db, 'admins');
        const snapshot = await getDocs(adminsRef);
        
        if (snapshot.empty) {
          setUsers([]);
          return;
        }        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            displayName: data.displayName || 'N/A',
            email: data.email || 'N/A',
            role: data.role || 'admin',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toLocaleDateString() : 'N/A',
            lastLogin: data.lastLogin?.toDate?.() ? data.lastLogin.toDate().toLocaleDateString() : 'N/A',
            permissions: data.permissions || []
          };
        });
        
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching admin users:', err);
        const errorMessage = 'Failed to load admin users. Please try again later.';
        setError(errorMessage);
        toast.error(errorMessage, {
          toastId: 'fetch-users-error' // Prevent duplicate toasts
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, authLoading]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === '' || 
           (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
           (user.email && user.email.toLowerCase().includes(searchLower)) ||
           (user.role && user.role.toLowerCase().includes(searchLower));
  });

  // View user details
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  // Delete user
  const handleDeleteUser = async (userId) => {    if (!currentUser) {
      toast.error('You must be logged in to perform this action', {
        toastId: 'auth-error'
      });
      return;
    }

    // Can only delete your own account (matches Firestore security rules)
    if (userId !== currentUser.uid) {
      toast.error('For security reasons, admins can only delete their own account', {
        toastId: 'delete-permission-error'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete your admin account? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'admins', userId));
      setUsers(users.filter(u => u.id !== userId));
      
      if (selectedUser?.id === userId) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }

      toast.success('Admin account deleted successfully', {
        toastId: 'delete-success'
      });
    } catch (err) {
      console.error('Error deleting admin account:', err);
      toast.error('Failed to delete admin account. Please try again.', {
        toastId: 'delete-error'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg mb-4">No admin users found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin User Management</h1>
          {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4">
          </div>
          <input
            type="text"
            placeholder="Search admin users..."
            className="w-full md:w-64 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Admin User Details</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Name:</label>
                <p>{selectedUser.displayName}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <label className="font-medium">Role:</label>
                <p>{selectedUser.role}</p>
              </div>
              <div>
                <label className="font-medium">Status:</label>
                <p>{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="font-medium">Created:</label>
                <p>{selectedUser.createdAt}</p>
              </div>
              <div>
                <label className="font-medium">Last Login:</label>
                <p>{selectedUser.lastLogin}</p>
              </div>
              <div>
                <label className="font-medium">Permissions:</label>
                <ul className="list-disc list-inside">
                  {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                    selectedUser.permissions.map((permission, index) => (
                      <li key={index}>{permission}</li>
                    ))
                  ) : (
                    <li>No specific permissions set</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
