import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ApiPromise } from '@polkadot/api';
import { initializeApi, disconnectApi } from '../services/polkadot/api';

interface ApiContextProps {
  api: ApiPromise | null;
  isApiReady: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

const ApiContext = createContext<ApiContextProps>({
  api: null,
  isApiReady: false,
  isConnecting: false,
  connectionError: null,
});

export const useApi = () => useContext(ApiContext);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // Initialize the API
        const apiInstance = await initializeApi();
        
        // Wait for the API to be ready
        await apiInstance.isReady;
        
        // Update state to reflect successful connection
        setApi(apiInstance);
        setIsApiReady(true);
        setIsConnecting(false);
        
        console.log('API context: connection established');
        
        // Set up listeners for disconnection or errors
        apiInstance.on('disconnected', () => {
          console.log('API disconnected');
          setIsApiReady(false);
        });
        
        apiInstance.on('error', (error) => {
          console.error('API error:', error);
          setConnectionError(`Connection error: ${error.message}`);
        });
        
      } catch (error) {
        console.error('Failed to connect to the API:', error);
        setConnectionError((error as Error).message);
        setIsConnecting(false);
        setIsApiReady(false);
      }
    };

    connect();

    return () => {
      // Clean up by disconnecting the API
      disconnectApi().catch(console.error);
    };
  }, []);

  return (
    <ApiContext.Provider value={{ api, isApiReady, isConnecting, connectionError }}>
      {children}
    </ApiContext.Provider>
  );
};