import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

// Get endpoint from environment or localStorage or fallback to default
const getDefaultEndpoint = (): string => {
  // Check localStorage first
  const savedEndpoint = localStorage.getItem('polkadot_endpoint');
  if (savedEndpoint) {
    return savedEndpoint;
  }
  
  // Then environment variable if available (using process.env for Create React App)
  if (process.env.REACT_APP_WS_ENDPOINT) {
    return process.env.REACT_APP_WS_ENDPOINT;
  }
  
  // Public endpoints as fallback (uncommenting one of these can help for demo purposes)
  // return 'wss://rpc.polkadot.io';  // Polkadot mainnet
  // return 'wss://kusama-rpc.polkadot.io';  // Kusama
  // return 'wss://westend-rpc.polkadot.io';  // Westend (testnet)
  
  // Last resort fallback for local development
  return 'ws://127.0.0.1:9944';
};

// Keep track of the current endpoint and API instance
let currentEndpoint = getDefaultEndpoint();
let api: ApiPromise | null = null;

/**
 * Initialize the API with an optional custom endpoint
 */
export const initializeApi = async (endpoint?: string): Promise<ApiPromise> => {
  // Use provided endpoint or current one
  const wsEndpoint = endpoint || currentEndpoint;
  
  // If endpoint has changed or API doesn't exist, create a new connection
  if (!api || endpoint !== currentEndpoint) {
    // If API exists and endpoint changed, disconnect first
    if (api && endpoint !== currentEndpoint) {
      console.log('Endpoint changed, disconnecting current API...');
      await api.disconnect();
      api = null;
    }
    
    // Update current endpoint if changed
    if (endpoint) {
      currentEndpoint = endpoint;
      // Save to localStorage for persistence
      localStorage.setItem('polkadot_endpoint', endpoint);
    }
    
    console.log('Connecting to Polkadot node:', wsEndpoint);
    
    // Create provider with auto-reconnect
    const provider = new WsProvider(wsEndpoint, 1000);
    
    // Add some debugging
    provider.on('connected', () => console.log('Provider connected to', wsEndpoint));
    provider.on('disconnected', () => console.log('Provider disconnected from', wsEndpoint));
    provider.on('error', (error) => console.error('Provider error:', error));
    
    // Create API
    api = await ApiPromise.create({ 
      provider,
      noInitWarn: true
    });
    
    // Wait for API to be ready
    await api.isReady;
    
    console.log('API initialized and ready');
  } 
  
  // Additional check to ensure API is actually connected
  if (api && !api.isConnected) {
    console.log('API exists but is not connected. Reconnecting...');
    await api.connect();
    await api.isReady;
    console.log('API reconnected');
  }
  
  return api;
};

/**
 * Disconnect the API
 */
export const disconnectApi = async (): Promise<void> => {
  if (api) {
    await api.disconnect();
    api = null;
    console.log('API disconnected');
  }
};

/**
 * Get the current endpoint being used
 */
export const getCurrentEndpoint = (): string => {
  return currentEndpoint;
};

/**
 * Change endpoint and create a new API connection
 */
export const changeEndpoint = async (newEndpoint: string): Promise<ApiPromise> => {
  return initializeApi(newEndpoint);
};

/**
 * Connect to the extension and get authorization
 */
export const connectExtension = async (appName: string): Promise<void> => {
  const extensions = await web3Enable(appName);
  if (extensions.length === 0) {
    throw new Error('No extension installed, or the user did not accept the authorization');
  }
  console.log('Extension connected');
};

/**
 * Get accounts from the extension
 */
export const getAccounts = async () => {
  const allAccounts = await web3Accounts();
  return allAccounts;
};

/**
 * Get the current API instance
 */
export const getApi = () => {
  if (!api) {
    throw new Error('API not initialized');
  }
  return api;
};

/**
 * Test the API connection
 */
export const testConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    if (!api) {
      return { success: false, message: 'API not initialized' };
    }
    
    if (!api.isConnected) {
      return { success: false, message: 'API not connected' };
    }
    
    // Try to fetch some basic chain information
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);
    
    return { 
      success: true, 
      message: `Connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Connection test failed: ${(error as Error).message}` 
    };
  }
};

// Predefined list of common Polkadot/Substrate endpoints
export const PREDEFINED_ENDPOINTS = {
  'Local Node': 'ws://127.0.0.1:38087',
  'Polkadot': 'wss://rpc.polkadot.io',
  'Kusama': 'wss://kusama-rpc.polkadot.io',
  'Westend': 'wss://westend-rpc.polkadot.io',
  'Rococo': 'wss://rococo-rpc.polkadot.io'
};