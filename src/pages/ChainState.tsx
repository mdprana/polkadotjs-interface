import React, { useState } from 'react';
import { useChainState } from '../hooks/useChainState';
import ParamInput from '../components/common/ParamInput';
import { useApi } from '../context/ApiContext';

const ChainState: React.FC = () => {
  const { isApiReady } = useApi();
  const { modules, isLoading, error, executeQuery } = useChainState();
  
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [params, setParams] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Get methods for selected module
  const moduleMethods = modules.find(m => m.name === selectedModule)?.methods || [];

  // Get parameters for selected method
  const methodParams = moduleMethods.find(m => m.name === selectedMethod)?.params || [];

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModule(e.target.value);
    setSelectedMethod('');
    setParams([]);
    setQueryResult(null);
    setQueryError(null);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMethod(e.target.value);
    setParams([]);
    setQueryResult(null);
    setQueryError(null);
  };

  const handleParamChange = (index: number, value: string) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };

  const handleQuery = async () => {
    setIsQuerying(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      // Convert params based on their types (if needed)
      const processedParams = params.map((param, index) => {
        const paramType = methodParams[index]?.type;
        if (paramType?.includes('Bool') && typeof param === 'string') {
          return param === 'true';
        }
        return param;
      });

      const result = await executeQuery(selectedModule, selectedMethod, processedParams);
      setQueryResult(result);
    } catch (err) {
      console.error('Query error:', err);
      setQueryError((err as Error).message);
    } finally {
      setIsQuerying(false);
    }
  };

  // Format the result for display
  const formattedResult = queryResult ? 
    (typeof queryResult.toHuman === 'function' ? 
      JSON.stringify(queryResult.toHuman(), null, 2) : 
      JSON.stringify(queryResult, null, 2)) : null;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Chain State</h1>
      
      {!isApiReady ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
          Waiting for API connection...
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          Error: {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Query Storage</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Module selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Module
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  value={selectedModule}
                  onChange={handleModuleChange}
                >
                  <option value="">Select a module</option>
                  {modules.map(module => (
                    <option key={module.name} value={module.name}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Method selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Method
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  value={selectedMethod}
                  onChange={handleMethodChange}
                  disabled={!selectedModule}
                >
                  <option value="">Select a method</option>
                  {moduleMethods.map(method => (
                    <option key={method.name} value={method.name}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parameters */}
            {selectedMethod && methodParams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Parameters</h3>
                {methodParams.map((param, index) => (
                  <ParamInput
                    key={`${param.name}-${index}`}
                    module={selectedModule}
                    method={selectedMethod}
                    name={param.name}
                    type={param.type}
                    isOptional={param.isOptional}
                    onChange={(value: string) => handleParamChange(index, value)}
                  />
                ))}
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end mb-6">
              <button
                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                  isQuerying || !selectedModule || !selectedMethod
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={handleQuery}
                disabled={!selectedModule || !selectedMethod || isQuerying}
              >
                {isQuerying ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Querying...
                  </div>
                ) : (
                  'Query'
                )}
              </button>
            </div>

            {/* Results section */}
            {(queryResult || queryError) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Result</h3>
                
                {queryError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-4">
                    {queryError}
                  </div>
                )}
                
                {formattedResult && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
                    <pre>{formattedResult}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Show help text when parameters are required but not provided */}
            {selectedMethod && methodParams.length > 0 && !queryResult && !queryError && (
              <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg">
                <h3 className="font-medium mb-1">Required Parameters</h3>
                <p>This method requires {methodParams.length} parameter{methodParams.length > 1 ? 's' : ''}:</p>
                <ul className="list-disc ml-5 mt-2">
                  {methodParams.map((param, index) => (
                    <li key={index}>
                      <strong>{param.name}</strong> ({param.type})
                      {param.isOptional ? ' (optional)' : ''}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">Please fill in the parameter{methodParams.length > 1 ? 's' : ''} above and click Query.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainState;