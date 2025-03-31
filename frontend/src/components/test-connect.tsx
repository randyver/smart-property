'use client';

import { useState } from 'react';

export default function ConnectionTest() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/test');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6">SmartProperty Connection Test</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className={`px-6 py-3 rounded-md font-medium ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white transition-colors`}
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            Pastikan backend berjalan di <code>localhost:5000</code>
          </p>
        </div>
      )}

      {response && (
        <div className="mt-6 p-4 bg-green-50 border border-green-400 rounded">
          <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}