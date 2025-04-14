import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import ParamInput from '../components/common/ParamInput';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Hardcoded parameters for known methods
const KNOWN_PARAMETERS: Record<string, Record<string, any[]>> = {
  balances: {
    transfer: [
      { name: 'dest', type: 'MultiAddress', isOptional: false },
      { name: 'value', type: 'Compact<Balance>', isOptional: false }
    ],
    transferKeepAlive: [
      { name: 'dest', type: 'MultiAddress', isOptional: false },
      { name: 'value', type: 'Compact<Balance>', isOptional: false }
    ],
    transferAll: [
      { name: 'dest', type: 'MultiAddress', isOptional: false },
      { name: 'keepAlive', type: 'bool', isOptional: false }
    ],
    forceTransfer: [
      { name: 'source', type: 'MultiAddress', isOptional: false },
      { name: 'dest', type: 'MultiAddress', isOptional: false },
      { name: 'value', type: 'Compact<Balance>', isOptional: false }
    ],
    setBalance: [
      { name: 'who', type: 'MultiAddress', isOptional: false },
      { name: 'newFree', type: 'Compact<Balance>', isOptional: false },
      { name: 'newReserved', type: 'Compact<Balance>', isOptional: false }
    ],
    forceSetBalance: [
      { name: 'who', type: 'MultiAddress', isOptional: false },
      { name: 'newFree', type: 'Compact<Balance>', isOptional: false }
    ],
    upgradeAccounts: [
      { name: 'who', type: 'Vec<AccountId32>', isOptional: false }
    ],
    transferAllowDeath: [
      { name: 'dest', type: 'MultiAddress', isOptional: false },
      { name: 'value', type: 'Compact<Balance>', isOptional: false }
    ],
    forceUnreserve: [
      { name: 'who', type: 'MultiAddress', isOptional: false },
      { name: 'amount', type: 'u128', isOptional: false }
    ],
    forceAdjustTotalIssuance: [
      { name: 'adjustment', type: 'i128', isOptional: false }
    ],
    burn: [
      { name: 'amount', type: 'Compact<Balance>', isOptional: false }
    ]
  },
  system: {
    remark: [
      { name: 'remark', type: 'Bytes', isOptional: false }
    ],
    setCode: [
      { name: 'code', type: 'Bytes', isOptional: false }
    ],
    setStorage: [
      { name: 'items', type: 'Vec<KeyValue>', isOptional: false }
    ],
    killStorage: [
      { name: 'keys', type: 'Vec<Key>', isOptional: false }
    ],
    killPrefix: [
      { name: 'prefix', type: 'Key', isOptional: false },
      { name: 'subkeys', type: 'u32', isOptional: false }
    ],
    remarkWithEvent: [
      { name: 'remark', type: 'Bytes', isOptional: false }
    ]
  },
  timestamp: {
    set: [
      { name: 'now', type: 'Compact<u64>', isOptional: false }
    ]
  },
  sudo: {
    sudo: [
      { name: 'call', type: 'Call', isOptional: false }
    ],
    sudoAs: [
      { name: 'who', type: 'MultiAddress', isOptional: false },
      { name: 'call', type: 'Call', isOptional: false }
    ],
    sudoUncheckedWeight: [
      { name: 'call', type: 'Call', isOptional: false },
      { name: 'weight', type: 'Weight', isOptional: false }
    ]
  },
  assets: {
    create: [
      { name: 'id', type: 'Compact<u32>', isOptional: false },
      { name: 'admin', type: 'MultiAddress', isOptional: false },
      { name: 'minBalance', type: 'u128', isOptional: false }
    ],
    transfer: [
      { name: 'id', type: 'Compact<u32>', isOptional: false },
      { name: 'target', type: 'MultiAddress', isOptional: false },
      { name: 'amount', type: 'Compact<u128>', isOptional: false }
    ]
  }
};

const Extrinsics: React.FC = () => {
  const { isApiReady, api } = useApi();
  const [modules, setModules] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methodParameters, setMethodParameters] = useState<any[]>([]);
  const [paramValues, setParamValues] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);
  const [txEvents, setTxEvents] = useState<any[] | null>(null);

  // Helper function to log module details for debugging
  const logModuleDetails = (module: string) => {
    if (!api) return;
    
    try {
      console.log(`Available methods in ${module}:`, Object.keys(api.tx[module]));
      
      // Try to examine a specific method
      if (api.tx[module].transfer) {
        console.log('Transfer method details:', api.tx[module].transfer);
      }
      
      // Log metadata detection capabilities
      if (api.registry && api.registry.findMetaCall(api.tx[module].transfer.callIndex)) {
        console.log('Metadata detection available');
      } else {
        console.log('Metadata detection NOT available');
      }
    } catch (err) {
      console.error('Error examining module:', err);
    }
  };

  // Fetch modules on component mount
  useEffect(() => {
    if (!isApiReady || !api) return;

    const fetchModules = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get all available modules with tx methods
        const availableModules = Object.keys(api.tx).sort()
          .filter(module => module !== '$metadata' && module !== 'council');
        
        setModules(availableModules);
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [api, isApiReady]);

  // Fetch methods when module changes
  useEffect(() => {
    if (!api || !selectedModule) {
      setMethods([]);
      return;
    }

    try {
      // Get methods for the selected module
      const availableMethods = Object.keys(api.tx[selectedModule])
        .filter(method => !method.startsWith('$'))
        .sort();
      
      setMethods(availableMethods);
    } catch (err) {
      console.error(`Failed to fetch methods for ${selectedModule}:`, err);
      setMethods([]);
    }
  }, [api, selectedModule]);

  // Get parameters when method is selected
  useEffect(() => {
    if (!selectedModule || !selectedMethod) {
      setMethodParameters([]);
      setParamValues([]);
      return;
    }

    // First check if we have hardcoded parameters for this method
    if (KNOWN_PARAMETERS[selectedModule] && KNOWN_PARAMETERS[selectedModule][selectedMethod]) {
      const params = KNOWN_PARAMETERS[selectedModule][selectedMethod];
      console.log('Using hardcoded parameters for', selectedModule, selectedMethod, params);
      setMethodParameters(params);
      setParamValues(new Array(params.length).fill(''));
      return;
    }

    // Fallback for common method naming patterns
    if (selectedMethod.toLowerCase().includes('transfer')) {
      // Most transfer methods have dest and value parameters
      const params = [
        { name: 'dest', type: 'MultiAddress', isOptional: false },
        { name: 'value', type: 'Compact<Balance>', isOptional: false }
      ];
      console.log('Using fallback transfer parameters for', selectedMethod);
      setMethodParameters(params);
      setParamValues(new Array(params.length).fill(''));
      return;
    }

    if (selectedMethod.toLowerCase().includes('set')) {
      // Most setter methods have at least one parameter
      const params = [
        { name: 'value', type: 'any', isOptional: false }
      ];
      console.log('Using fallback setter parameter for', selectedMethod);
      setMethodParameters(params);
      setParamValues(new Array(params.length).fill(''));
      return;
    }

    // If no hardcoded parameters, try to get them from the API
    if (!api) return;

    try {
      console.log('Trying to get parameters for', selectedModule, selectedMethod);
      
      // Try to infer parameters by examining the method
      const tx = api.tx[selectedModule][selectedMethod];
      
      if (!tx) {
        console.warn('Method not found:', selectedModule, selectedMethod);
        setMethodParameters([]);
        setParamValues([]);
        return;
      }
      
      // Try to get metadata - we'll wrap this in a try/catch
      try {
        const meta = api.registry.findMetaCall(tx.callIndex);
        
        if (meta && meta.args) {
          const params = meta.args.map((arg: any) => {
            return {
              name: arg.name ? arg.name.toString() : `param${Math.random().toString(36).slice(2, 7)}`,
              type: arg.type ? arg.type.toString() : 'unknown',
              isOptional: false
            };
          });
          
          console.log('Found parameters from metadata:', params);
          setMethodParameters(params);
          setParamValues(new Array(params.length).fill(''));
          return;
        }
      } catch (metaError) {
        console.warn('Error getting metadata parameters:', metaError);
        // Continue to fallback approach
      }
      
      // If we get here, we couldn't find parameters
      console.log('No parameters found for', selectedModule, selectedMethod);
      setMethodParameters([]);
      setParamValues([]);
    } catch (err) {
      console.error(`Error getting parameters for ${selectedModule}.${selectedMethod}:`, err);
      setMethodParameters([]);
      setParamValues([]);
    }
  }, [api, selectedModule, selectedMethod]);

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModule = e.target.value;
    setSelectedModule(newModule);
    setSelectedMethod('');
    resetTxState();
    
    // Debug the module
    if (newModule) {
      logModuleDetails(newModule);
    }
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMethod(e.target.value);
    resetTxState();
  };

  const resetTxState = () => {
    setSubmissionStatus(null);
    setTxHash(null);
    setBlockHash(null);
    setTxEvents(null);
    setSubmissionError(null);
    setParamValues([]);
  };

  const handleParamChange = (index: number, value: string) => {
    const newValues = [...paramValues];
    newValues[index] = value;
    setParamValues(newValues);
  };

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable('Polkadot Interface');
      if (extensions.length === 0) {
        throw new Error('No extension found. Please install Polkadot.js extension.');
      }
      
      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      
      if (allAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(allAccounts[0].address);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setSubmissionError((err as Error).message);
    }
  };

  const formatParameter = (param: string, type: string) => {
    // Handle different parameter types correctly
    if (type.toLowerCase().includes('bool')) {
      return param === 'true';
    }
    
    if (type.toLowerCase().includes('compact<u128>') || type.toLowerCase().includes('balance')) {
      // For balance, handle as string to avoid number precision issues
      return param;
    }
    
    // Default parameter processing
    return param;
  };

  const handleSubmit = async () => {
    if (!api || !selectedAccount) return;
    
    setIsSubmitting(true);
    resetTxState();
    setSubmissionStatus('Preparing transaction...');

    try {
      // Get the selected account
      const selectedAccountObj = accounts.find(a => a.address === selectedAccount);
      if (!selectedAccountObj) {
        throw new Error('Selected account not found');
      }

      // Get the injector for the account
      const injector = await web3FromSource(selectedAccountObj.meta.source);
      
      // Process parameters
      const processedParams = methodParameters.map((param, index) => 
        formatParameter(paramValues[index], param.type)
      );
      
      console.log('Submitting extrinsic with params:', processedParams);
      
      // Create and submit the transaction
      setSubmissionStatus('Waiting for signature...');
      
      // Create the extrinsic - add a try/catch here
      let extrinsic;
      try {
        extrinsic = api.tx[selectedModule][selectedMethod](...processedParams);
      } catch (extrinsicError) {
        console.error('Error creating extrinsic:', extrinsicError);
        throw new Error(`Error creating extrinsic: ${(extrinsicError as Error).message}`);
      }
      
      // Sign and send
      const unsub = await extrinsic.signAndSend(
        selectedAccount,
        { signer: injector.signer },
        (result) => {
          if (result.status.isInBlock) {
            setBlockHash(result.status.asInBlock.toString());
            setTxHash(result.txHash.toString());
            setSubmissionStatus(`Included in block ${result.status.asInBlock.toString()}`);
            
            // Process events
            if (result.events) {
              const events = result.events
                .filter(({ event }) => 
                  !event.section.includes('system') || 
                  !event.method.includes('ExtrinsicSuccess'))
                .map(({ event }) => ({
                  section: event.section,
                  method: event.method,
                  data: event.data.toString()
                }));
              
              setTxEvents(events);
            }
          } else if (result.status.isFinalized) {
            setBlockHash(result.status.asFinalized.toString());
            setSubmissionStatus(`Finalized in block ${result.status.asFinalized.toString()}`);
            
            // Add events if not already processed
            if (!txEvents && result.events) {
              const events = result.events
                .filter(({ event }) => 
                  !event.section.includes('system') || 
                  !event.method.includes('ExtrinsicSuccess'))
                .map(({ event }) => ({
                  section: event.section,
                  method: event.method,
                  data: event.data.toString()
                }));
              
              setTxEvents(events);
            }
            
            unsub();
            setIsSubmitting(false);
          } else if (result.isError) {
            setSubmissionError('Transaction failed');
            unsub();
            setIsSubmitting(false);
          }
        }
      );
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Extrinsics</h1>
      
      {!isApiReady ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
          Waiting for API connection...
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          Error: {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Submit Extrinsic</h2>
          </div>
          
          <div className="p-6">
            {/* Wallet section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Account</h3>
              
              {accounts.length === 0 ? (
                <div>
                  <p className="text-gray-600 mb-3">
                    Connect your Polkadot.js extension wallet to submit extrinsics.
                  </p>
                  <button 
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-700">Wallet connected</span>
                  </div>
                  
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  >
                    {accounts.map(account => (
                      <option key={account.address} value={account.address}>
                        {account.meta.name || 'Unknown'} ({account.address.substring(0, 6)}...{account.address.substring(account.address.length - 6)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Module selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extrinsic Module
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  value={selectedModule}
                  onChange={handleModuleChange}
                >
                  <option value="">Select a module</option>
                  {modules.map(module => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>

              {/* Method selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extrinsic Method
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  value={selectedMethod}
                  onChange={handleMethodChange}
                  disabled={!selectedModule}
                >
                  <option value="">Select a method</option>
                  {methods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parameters */}
            {selectedMethod && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Parameters</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {methodParameters && methodParameters.length > 0 ? (
                    methodParameters.map((param, index) => (
                      <ParamInput
                        key={`${param.name}-${index}`}
                        module={selectedModule}
                        method={selectedMethod}
                        name={param.name}
                        type={param.type}
                        isOptional={param.isOptional}
                        onChange={(value) => handleParamChange(index, value)}
                      />
                    ))
                  ) : (
                    <div className="text-gray-500 italic">
                      This method has no parameters.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end mb-6">
              <button
                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                  isSubmitting || !selectedModule || !selectedMethod || accounts.length === 0 || !selectedAccount ||
                  (methodParameters.length > 0 && paramValues.filter(Boolean).length !== methodParameters.length)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedModule || !selectedMethod || accounts.length === 0 || !selectedAccount ||
                          (methodParameters.length > 0 && paramValues.filter(Boolean).length !== methodParameters.length)}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Extrinsic'
                )}
              </button>
            </div>

            {/* Transaction status and details */}
            {(submissionStatus || submissionError || txHash || blockHash) && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Transaction Status</h3>
                
                {submissionError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Error: {submissionError}</span>
                    </div>
                  </div>
                )}
                
                {submissionStatus && (
                  <div className={`border px-4 py-3 rounded-lg mb-4 ${
                    submissionStatus.includes('Finalized') 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        {submissionStatus.includes('Finalized') ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span>{submissionStatus}</span>
                    </div>
                  </div>
                )}
                
                {(txHash || blockHash) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {txHash && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Transaction Hash</h4>
                        <div className="font-mono text-sm break-all bg-white p-2 rounded border border-gray-300">
                          {txHash}
                        </div>
                      </div>
                    )}
                    
                    {blockHash && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Block Hash</h4>
                        <div className="font-mono text-sm break-all bg-white p-2 rounded border border-gray-300">
                          {blockHash}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show events */}
                {txEvents && txEvents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Events</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-auto">
                      {txEvents.map((event, index) => (
                        <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="font-medium text-sm">{event.section}.{event.method}</span>
                          </div>
                          <div className="mt-1 font-mono text-xs break-all bg-white p-1 rounded">
                            {event.data}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Extrinsics;