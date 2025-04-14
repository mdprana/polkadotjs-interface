import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedExtension, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

let extensions: InjectedExtension[] = [];
let accounts: InjectedAccountWithMeta[] = [];

export const connectWallet = async (appName: string): Promise<{
  extensions: InjectedExtension[];
  accounts: InjectedAccountWithMeta[];
}> => {
  try {
    // Try to connect to any available extensions (Polkadot.js, SubWallet, etc.)
    extensions = await web3Enable(appName);
    
    if (extensions.length === 0) {
      throw new Error('No wallet extension found. Please install a compatible wallet like SubWallet or Polkadot.js extension.');
    }
    
    // Get accounts from connected extensions
    accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please create an account in your wallet.');
    }
    
    return { extensions, accounts };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const getInjector = async (address: string) => {
  if (!address) {
    throw new Error('No address provided');
  }
  
  return web3FromAddress(address);
};

export const getAccounts = () => accounts;

export const getExtensions = () => extensions;

// For wallets that don't use the extension approach, you can add direct connection methods
export const connectWithoutExtension = async () => {
  // Here you would implement a direct connection method
  // For demo purposes, create some mock accounts
  return [
    {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      meta: { name: 'Development Account' },
    }
  ];
};

// This function will attempt to connect using various methods
export const connectAny = async (appName: string) => {
  try {
    // Try extension-based wallets first
    const { accounts } = await connectWallet(appName);
    return accounts;
  } catch (error) {
    console.warn('Extension wallet connection failed, trying alternative methods:', error);
    
    // Try direct connection
    return connectWithoutExtension();
  }
};