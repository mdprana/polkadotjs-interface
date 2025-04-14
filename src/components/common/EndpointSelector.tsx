import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { PREDEFINED_ENDPOINTS } from '../../services/polkadot/api';

const EndpointSelector: React.FC = () => {
  const { isApiReady, isConnecting, connectionError, endpoint, changeEndpoint } = useApi();
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('custom');
  const [showCustom, setShowCustom] = useState(false);

  // Initialize state based on current endpoint
  useEffect(() => {
    // Check if current endpoint is one of our predefined ones
    const foundKey = Object.entries(PREDEFINED_ENDPOINTS).find(
      ([_, value]) => value === endpoint
    )?.[0];
    
    if (foundKey) {
      setSelectedEndpoint(foundKey);
      setShowCustom(false);
    } else {
      setSelectedEndpoint('custom');
      setCustomEndpoint(endpoint);
      setShowCustom(true);
    }
  }, [endpoint]);

  // Handle preset selection change
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedEndpoint(selected);
    
    if (selected === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      // Connect to the selected predefined endpoint
      const newEndpoint = PREDEFINED_ENDPOINTS[selected as keyof typeof PREDEFINED_ENDPOINTS];
      if (newEndpoint) {
        handleConnect(newEndpoint);
      }
    }
  };

  // Connect to the specified endpoint
  const handleConnect = async (endpointToUse: string) => {
    if (!endpointToUse) return;
    
    try {
      await changeEndpoint(endpointToUse);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-3 text-gray-800">Network Connection</h3>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            connectionError ? 'bg-red-500' : 
            isConnecting ? 'bg-yellow-500 animate-pulse' : 
            isApiReady ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {connectionError ? 'Connection Error' : 
             isConnecting ? 'Connecting...' : 
             isApiReady ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {isApiReady && (
          <div className="text-xs text-gray-500 overflow-hidden text-ellipsis">
            Current: {endpoint}
          </div>
        )}
        
        {connectionError && (
          <div className="mt-1 text-xs text-red-600 overflow-hidden text-ellipsis">
            {connectionError}
          </div>
        )}
      </div>
      
      {/* Endpoint Selection */}
      <div className="space-y-3">
        <div>
          <label htmlFor="endpoint-preset" className="block text-sm font-medium text-gray-700 mb-1">
            Preset Endpoints
          </label>
          <select
            id="endpoint-preset"
            value={selectedEndpoint}
            onChange={handlePresetChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            {Object.keys(PREDEFINED_ENDPOINTS).map(key => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
            <option value="custom">Custom Endpoint</option>
          </select>
        </div>
        
        {showCustom && (
          <div className="flex flex-col space-y-2">
            <label htmlFor="custom-endpoint" className="block text-sm font-medium text-gray-700">
              Custom Endpoint
            </label>
            <div className="flex space-x-2">
              <input
                id="custom-endpoint"
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="ws://127.0.0.1:9944"
                className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              <button
                onClick={() => handleConnect(customEndpoint)}
                disabled={isConnecting || !customEndpoint}
                className={`px-3 py-2 rounded-md text-white text-sm ${
                  isConnecting || !customEndpoint
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        )}
        
        <div className="pt-2 text-xs text-gray-500">
          <p>
            Note: For production use, connect to a public node or your own hosted node. 
            Local Zombienet should only be used for development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EndpointSelector;