import { useState, useEffect, useContext, useCallback } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

const AddAdminModal = ({ isOpen, onClose, onAdd }) => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    permissions: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // Check if current user has permission to create admins
      const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!currentUserDoc.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const currentUserData = currentUserDoc.data();
      const hasUsersPermission = currentUserData.permissions?.includes('users');
      
      if (!hasUsersPermission) {
        throw new Error('Access denied. You do not have permission to create admin users.');
      }

      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create the admin document in Firestore      // Get creator's data to check if they are superadmin
      const creatorDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      const creatorData = creatorDoc.data();
      
      const adminData = {
        email: formData.email,
        displayName: formData.displayName,
        // If creator is superadmin, use selected permissions, otherwise clear them
        permissions: creatorData.role === 'superadmin' ? formData.permissions : [],
        isActive: true,
        role: 'admin', // New users can only be regular admins
        createdAt: new Date(),
        lastLogin: null
      };

      await setDoc(doc(db, 'admins', userCredential.user.uid), adminData);

      toast.success('Admin user created successfully');
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Admin</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Permissions</label>
              <div className="mt-2 space-y-2">                {['products', 'orders', 'users', 'settings'].map(permission => {
                  // Check if current user is superadmin
                  const isSuperAdmin = currentUser?.uid === 'RXEQ16eMsfW5WrEnxReqVwI3JmE2';
                  
                  // Only show checkboxes if user is superadmin
                  if (!isSuperAdmin) {
                    return null;
                  }

                  return (
                    <label key={permission} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...formData.permissions, permission]
                            : formData.permissions.filter(p => p !== permission);
                          setFormData({ ...formData, permissions: newPermissions });
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{permission}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [hasUsersPermission, setHasUsersPermission] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');  // Function to check if current user has users permission, memoized with useCallback
  const checkUsersPermission = useCallback(async () => {
    if (!currentUser) return false;
    
    try {
      const userDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      // Superadmins have all permissions automatically
      if (userData.role === 'superadmin') return true;
      
      return userData.permissions?.includes('users') || false;
    } catch (err) {
      console.error('Error checking permissions:', err);
      return false;
    }
  }, [currentUser]);

  // Effect to check user permissions
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkUsersPermission();
      setHasUsersPermission(hasPermission);
    };
    checkPermission();
  }, [checkUsersPermission]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading) return;
      
      if (!currentUser) {
        setError('Please log in to view admin users');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check for users permission
        const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        
        if (!currentUserDoc.exists()) {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Check if user has 'users' permission
        const currentUserData = currentUserDoc.data();
        const hasUsersPermission = currentUserData.permissions?.includes('users');
        
        if (!hasUsersPermission) {
          setError('Access denied. You do not have permission to view users.');
          setLoading(false);
          return;
        }

        const adminsRef = collection(db, 'admins');
        const snapshot = await getDocs(adminsRef);

        const usersData = snapshot.docs.map(doc => {
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
        toast.error(errorMessage);
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
  const handleDeleteUser = async (userId) => {
    if (!currentUser) {
      toast.error('You must be logged in to perform this action', {
        toastId: 'auth-error'
      });
      return;
    }

    try {
      // Check if the user has 'users' permission
      const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!currentUserDoc.exists()) {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      const currentUserData = currentUserDoc.data();
      const hasUsersPermission = currentUserData.permissions?.includes('users');
      
      if (!hasUsersPermission) {
        toast.error('Access denied. You do not have permission to manage users.');
        return;
      }

      // Even with users permission, admins can only delete their own account
      if (userId !== currentUser.uid) {
        toast.error('For security reasons, admins can only delete their own account', {
          toastId: 'delete-permission-error'
        });
        return;
      }

      if (!window.confirm('Are you sure you want to delete your admin account? This action cannot be undone.')) {
        return;
      }

      await deleteDoc(doc(db, 'admins', userId));
      setUsers(users.filter(u => u.id !== userId));
      
      if (selectedUser?.id === userId) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }

      toast.success('Admin account deleted successfully');
    } catch (err) {
      console.error('Error deleting admin account:', err);
      toast.error('Failed to delete admin account. Please try again.');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin User Management</h1>
          {hasUsersPermission && (
            <button
              onClick={() => setIsAddAdminModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add New Admin
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* User list */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-500">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    {currentUser.uid === user.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onAdd={() => {
          // Refresh the users list after adding a new admin
          window.location.reload();
        }}
      />

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">User Details</h3>
              <div className="space-y-3">
                <p><strong>Name:</strong> {selectedUser.displayName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Joined:</strong> {selectedUser.createdAt}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin}</p>
                <div>
                  <strong>Permissions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedUser.permissions.map(permission => (
                      <li key={permission} className="capitalize">{permission}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
