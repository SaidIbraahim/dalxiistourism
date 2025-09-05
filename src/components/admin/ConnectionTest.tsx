import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing connection...');
    
    try {
      // Simple query to test connection
      const { data, error } = await supabase
        .from('bookings')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
      setMessage('Connection successful!');
    } catch (error: any) {
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Database Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={status === 'testing'}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'testing' ? 'Testing...' : 'Test Connection'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;