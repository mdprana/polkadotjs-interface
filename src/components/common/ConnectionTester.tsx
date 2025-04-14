import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';

const ConnectionTester: React.FC = () => {
  const { api } = useApi();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    if (!api) {
      setTestResult('API not initialized');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Test 1: Check if connected
      if (!api.isConnected) {
        setTestResult('API not connected');
        return;
      }

      // Test 2: Try fetching chain info
      const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
      ]);

      setTestResult(`Connected to ${chain} using ${nodeName} v${nodeVersion}`);
    } catch (error) {
      setTestResult(`Test failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Connection Tester</h3>
      
      <button
        onClick={runConnectionTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {testResult && (
        <div className="mt-3 p-3 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ConnectionTester;