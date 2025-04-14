import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ApiPromise } from '@polkadot/api';
import { 
  initializeApi, 
  disconnectApi, 
  getCurrentEndpoint, 
  changeEndpoint 
} from '../services/polkadot/api';

interface ApiContextProps {
  api: ApiPromise | null;
  isApiReady: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  endpoint: string;
  changeEndpoint: (newEndpoint: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextProps>({
  api: null,
  isApiReady: false,
  isConnecting: false,
  connectionError: null,
  endpoint: '',
  changeEndpoint: async () => {},
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
  const [endpoint, setEndpoint] = useState(getCurrentEndpoint());

  // Function to change endpoint and reconnect
  const handleChangeEndpoint = async (newEndpoint: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Change endpoint and get new API instance
      const apiInstance = await changeEndpoint(newEndpoint);
      
      // Update state
      setApi(apiInstance);
      setEndpoint(newEndpoint);
      setIsApiReady(true);
      setConnectionError(null);
      
      console.log('API connection changed to:', newEndpoint);
    } catch (error) {
      console.error('Failed to change endpoint:', error);
      setConnectionError(`Failed to connect to ${newEndpoint}: ${(error as Error).message}`);
      setIsApiReady(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Initial connection effect
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
        
        // Update endpoint in case it was changed during initialization
        setEndpoint(getCurrentEndpoint());
        
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
    <ApiContext.Provider 
      value={{ 
        api, 
        isApiReady, 
        isConnecting, 
        connectionError,
        endpoint,
        changeEndpoint: handleChangeEndpoint
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};