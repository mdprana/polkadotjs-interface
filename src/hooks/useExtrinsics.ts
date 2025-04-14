import { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';

interface ExtrinsicModule {
  name: string;
  methods: {
    name: string;
    params: {
      name: string;
      type: string;
      isOptional: boolean;
    }[];
  }[];
}

export const useExtrinsics = () => {
  const { api, isApiReady } = useApi();
  const [modules, setModules] = useState<ExtrinsicModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiReady || !api) return;

    const fetchModules = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const modules: ExtrinsicModule[] = [];
        
        // Get all extrinsic modules from the API
        const apiModules = Object.keys(api.tx).sort();
        
        for (const moduleName of apiModules) {
          const methods: ExtrinsicModule['methods'] = [];
          
          // Skip certain built-in modules if needed
          if (moduleName === '$metadata') {
            continue;
          }
          
          // Get methods for each module
          const moduleEntries = Object.entries(api.tx[moduleName]);
          
          for (const [methodName, method] of moduleEntries) {
            if (methodName.startsWith('$')) continue;
            
            // Get method metadata to extract parameters
            try {
              const params: { name: string; type: string; isOptional: boolean }[] = [];
              
              // Attempt to get parameter info from method call index
              if (method.callIndex) {
                try {
                  const methodMeta = api.registry.findMetaCall(method.callIndex);
                  
                  // Safely extract arguments
                  if (methodMeta && methodMeta.args && Array.isArray(methodMeta.args)) {
                    methodMeta.args.forEach((arg, index) => {
                      // Extract name and type safely
                      let name = `param${index}`;
                      let type = 'unknown';
                      
                      try {
                        // Handle different API structures
                        if (arg && typeof arg === 'object') {
                          if ('name' in arg) {
                            name = String(arg.name);
                          }
                          
                          if ('type' in arg) {
                            type = String(arg.type);
                          }
                        }
                      } catch (err) {
                        console.warn(`Error extracting param details for ${moduleName}.${methodName}:`, err);
                      }
                      
                      params.push({
                        name,
                        type,
                        isOptional: false
                      });
                    });
                  }
                } catch (err) {
                  console.warn(`Error getting metadata for ${moduleName}.${methodName}:`, err);
                  // Use a fallback approach
                  params.push({
                    name: 'param',
                    type: 'any',
                    isOptional: false
                  });
                }
              }
              
              methods.push({
                name: methodName,
                params: params.length ? params : [{ name: 'param', type: 'any', isOptional: false }]
              });
            } catch (err) {
              console.warn(`Could not get metadata for ${moduleName}.${methodName}`, err);
              // Add a fallback method entry
              methods.push({
                name: methodName,
                params: [{ name: 'param', type: 'any', isOptional: false }]
              });
            }
          }
          
          if (methods.length > 0) {
            modules.push({
              name: moduleName,
              methods
            });
          }
        }

        setModules(modules);
      } catch (err) {
        console.error('Failed to fetch extrinsic modules:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [api, isApiReady]);

  // Function to create an extrinsic
  const createExtrinsic = (module: string, method: string, params: any[] = []): SubmittableExtrinsic<'promise', ISubmittableResult> | null => {
    if (!api || !isApiReady) {
      return null;
    }

    try {
      return api.tx[module][method](...params);
    } catch (error) {
      console.error(`Error creating extrinsic ${module}.${method}:`, error);
      throw error;
    }
  };

  return { modules, isLoading, error, createExtrinsic };
};