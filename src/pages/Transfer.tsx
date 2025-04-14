import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';

const Transfer: React.FC = () => {
  const { isApiReady, api } = useApi();
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceRaw, setBalanceRaw] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info' | null, message: string | null}>({type: null, message: null});
  const [tokenSymbol, setTokenSymbol] = useState('UNIT');
  const [tokenDecimals, setTokenDecimals] = useState(12);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);

  useEffect(() => {
    if (isApiReady && api) {
      // Get token metadata
      try {
        const chainProperties = api.registry.getChainProperties();
        if (chainProperties) {
          // Fix for the toNumber error - use a safer approach
          const tokenSymbolValue = chainProperties.tokenSymbol.unwrapOr(['UNIT'])[0].toString();
          
          // Instead of toNumber(), use a type assertion or conversion
          const decimalsValue = chainProperties.tokenDecimals.unwrapOr([12])[0];
          const tokenDecimalsValue = typeof decimalsValue === 'number' 
            ? decimalsValue 
            : Number(decimalsValue.toString());
          
          setTokenSymbol(tokenSymbolValue);
          setTokenDecimals(tokenDecimalsValue);
        }
      } catch (error) {
        console.error('Error getting chain properties:', error);
      }
    }
  }, [api, isApiReady]);

  useEffect(() => {
    // Fetch balance when account is selected
    const fetchBalance = async () => {
      if (!api || !isApiReady || !selectedAccount) {
        setBalance(null);
        setBalanceRaw(null);
        return;
      }

      try {
        // Fixed approach to get account balance
        const accountInfo = await api.query.system.account(selectedAccount);
        
        // Handle the correct type structure
        if (accountInfo) {
          const accountData = (accountInfo as any).data;
          const free = accountData?.free;
          
          if (free) {
            setBalanceRaw(free);
            const formattedBalance = formatBalance(free, { withUnit: tokenSymbol, decimals: tokenDecimals });
            setBalance(formattedBalance);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
        setBalanceRaw(null);
      }
    };

    fetchBalance();
    // Set up a timer to refresh the balance
    const interval = setInterval(fetchBalance, 6000);
    return () => clearInterval(interval);
  }, [api, isApiReady, selectedAccount, tokenSymbol, tokenDecimals]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setStatus({type: 'info', message: 'Connecting to wallet...'});

    try {
      const extensions = await web3Enable('Polkadot Interface');
      if (extensions.length === 0) {
        throw new Error('No extension found. Please install Polkadot.js extension or SubWallet.');
      }
      
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet extension.');
      }
      
      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0].address);
      setStatus({type: 'success', message: 'Wallet connected successfully'});
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setStatus({type: 'error', message: (error as Error).message});
    } finally {
      setIsConnecting(false);
    }
  };

  const setPercentage = (percent: number) => {
    if (!balanceRaw) return;
    
    try {
      // Get raw balance as string
      const rawBalance = balanceRaw.toString();
      
      // Calculate the percentage directly as a decimal
      const factor = percent / 100;
      
      // Parse the raw balance to a number (but keep as string for large numbers)
      const balanceNum = Number(rawBalance) / Math.pow(10, tokenDecimals);
      
      // Apply the percentage
      const calculatedAmount = balanceNum * factor;
      
      // If the amount is too large for decimal calculation, we'll need a different approach
      if (!Number.isSafeInteger(calculatedAmount * Math.pow(10, tokenDecimals))) {
        // For very large numbers, use a simpler approach with reduced precision
        const simpleAmount = Math.floor(calculatedAmount * 1000) / 1000;
        setAmount(simpleAmount.toString());
      } else {
        // Normal case - just set the calculated amount
        setAmount(calculatedAmount.toString());
      }
    } catch (error) {
      console.error('Error calculating percentage:', error);
    }
  };

  const resetTxState = () => {
    setStatus({type: null, message: null});
    setTxHash(null);
    setBlockHash(null);
  };

  const handleSubmit = async () => {
    if (!api || !isApiReady || !selectedAccount || !recipient || !amount) {
      setStatus({type: 'error', message: 'Please fill in all fields'});
      return;
    }
    
    setIsSubmitting(true);
    resetTxState();
    setStatus({type: 'info', message: 'Preparing transaction...'});

    try {
      // Check if balances module exists
      if (!api.tx.balances) {
        console.error('Balances module not found!');
        // Log available modules to help debug
        console.log('Available modules:', Object.keys(api.tx));
        throw new Error('Balances module not found on this chain');
      }

      // Check if transfer method exists
      if (typeof api.tx.balances.transfer !== 'function') {
        console.error('Transfer method not found!');
        // Log available methods to help debug
        console.log('Available methods in balances:', Object.keys(api.tx.balances));
        
        // Try to find an alternative transfer method
        const transferMethod = Object.keys(api.tx.balances).find(method => 
          method.toLowerCase().includes('transfer')
        );
        
        if (!transferMethod) {
          throw new Error('Transfer method not found in balances module');
        }
        
        setStatus({type: 'info', message: `Using ${transferMethod} instead of transfer`});
      }

      // Get the selected account
      const selectedAccountObj = accounts.find(a => a.address === selectedAccount);
      if (!selectedAccountObj) {
        throw new Error('Selected account not found');
      }

      // Get the injector for the account
      const injector = await web3FromSource(selectedAccountObj.meta.source);
      
      // Convert amount to string-based big integer to avoid floating point issues
      const rawAmount = amount.includes('.') 
        ? amount.replace('.', '').padEnd(amount.length - amount.indexOf('.') - 1 + tokenDecimals, '0')
        : amount + '0'.repeat(tokenDecimals);

      // Create and submit the transfer transaction
      setStatus({type: 'info', message: 'Waiting for signature...'});
      
      // Create a transfer extrinsic using dynamic method lookup
      let transfer;
      if (typeof api.tx.balances.transfer === 'function') {
        transfer = api.tx.balances.transfer(recipient, rawAmount);
      } else {
        // Try transferKeepAlive if transfer is not available
        if (typeof api.tx.balances.transferKeepAlive === 'function') {
          transfer = api.tx.balances.transferKeepAlive(recipient, rawAmount);
        } else {
          throw new Error('No suitable transfer method found');
        }
      }
      
      // Sign and send the transaction
      const unsub = await transfer.signAndSend(
        selectedAccount,
        { signer: injector.signer },
        ({ status, dispatchError, txHash }) => {
          if (txHash) {
            setTxHash(txHash.toString());
          }
          
          if (status.isInBlock) {
            setBlockHash(status.asInBlock.toString());
            setStatus({type: 'info', message: `Transaction included in block ${status.asInBlock.toString()}`});
          } else if (status.isFinalized) {
            setBlockHash(status.asFinalized.toString());
            
            if (dispatchError) {
              let errorMessage;
              
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}`;
              } else {
                errorMessage = dispatchError.toString();
              }
              
              setStatus({type: 'error', message: `Transaction failed: ${errorMessage}`});
            } else {
              setStatus({type: 'success', message: `Transaction finalized in block ${status.asFinalized.toString()}`});
              // Clear form
              setAmount('');
              setRecipient('');
            }
            
            unsub();
            setIsSubmitting(false);
          }
        }
      );
    } catch (error) {
      console.error('Transaction error:', error);
      setStatus({type: 'error', message: (error as Error).message});
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Transfer Tokens</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Send {tokenSymbol}</h2>
        </div>
        
        <div className="p-6">
          {/* Wallet connection */}
          {accounts.length === 0 ? (
            <div className="mb-8 text-center">
              <p className="text-gray-600 mb-4">
                Connect your wallet to send tokens
              </p>
              <button 
                className={`px-6 py-3 rounded-lg text-white transition-colors ${
                  isConnecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Wallet
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Account
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {accounts.map(account => (
                    <option key={account.address} value={account.address}>
                      {account.meta.name || 'Unknown'} ({account.address.substring(0, 6)}...{account.address.substring(account.address.length - 6)})
                    </option>
                  ))}
                </select>
                
                {balance && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Balance: {balance}
                  </div>
                )}
              </div>
              
              {/* Recipient input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="5..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.0"
                    min="0"
                    step="0.000000000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{tokenSymbol}</span>
                  </div>
                </div>
                
                {/* Percentage buttons */}
                {balanceRaw && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPercentage(25)}
                      className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded border border-gray-300 transition-colors"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentage(50)}
                      className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded border border-gray-300 transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentage(75)}
                      className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded border border-gray-300 transition-colors"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentage(100)}
                      className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded border border-gray-300 transition-colors"
                    >
                      100%
                    </button>
                  </div>
                )}
              </div>
              
              {/* Submit button */}
              <div className="mt-8">
                <button
                  className={`w-full px-6 py-3 rounded-lg text-white transition-colors ${
                    isSubmitting || !recipient || !amount
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !recipient || !amount}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Tokens'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Status messages */}
          {status.message && (
            <div className={`mt-6 px-4 py-3 rounded-lg ${
              status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex items-start">
                {status.type === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {status.type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status.type === 'info' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{status.message}</span>
              </div>
            </div>
          )}
          
          {/* Transaction details */}
          {(txHash || blockHash) && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-md font-medium mb-3 text-gray-800">Transaction Details</h3>
              
              <div className="space-y-3">
                {txHash && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Transaction Hash</h4>
                    <div className="bg-white p-2 rounded border border-gray-200 font-mono text-xs break-all">
                      {txHash}
                    </div>
                  </div>
                )}
                
                {blockHash && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Block Hash</h4>
                    <div className="bg-white p-2 rounded border border-gray-200 font-mono text-xs break-all">
                      {blockHash}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;