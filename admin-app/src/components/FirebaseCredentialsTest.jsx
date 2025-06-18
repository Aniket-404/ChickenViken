import { useState, useEffect } from 'react';
import { runTests } from '../firebase/credentialsTest';

const FirebaseCredentialsTest = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkCredentials() {
      try {
        setLoading(true);
        const testResults = await runTests();
        setResults(testResults);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    checkCredentials();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Firebase Credentials Test</h2>
      
      {loading && <p>Testing credentials...</p>}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-3">
          Error: {error}
        </div>
      )}
      
      {results && (
        <div>
          <div className={`p-3 rounded mb-2 ${results.adminConfigValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <strong>Admin Firebase Config:</strong> {results.adminConfigValid ? 'VALID' : 'INVALID'}
          </div>
          
          <div className={`p-3 rounded mb-2 ${results.originalConfigValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <strong>Original Firebase Config:</strong> {results.originalConfigValid ? 'VALID' : 'INVALID'}
          </div>
          
          {!results.adminConfigValid && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
              <h3 className="font-bold">Troubleshooting Steps:</h3>
              <ol className="list-decimal ml-5 mt-2">
                <li>Verify that Firebase Authentication is enabled in the Firebase Console</li>
                <li>Verify that Email/Password authentication is enabled</li>
                <li>Check if the API key is correct</li>
                <li>Ensure that the Firebase project exists and is active</li>
                <li>Check if the domain you're using is authorized in the Firebase Console</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FirebaseCredentialsTest;
