import { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';

interface ChainStateModule {
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

export const useChainState = () => {
  const { api, isApiReady } = useApi();
  const [modules, setModules] = useState<ChainStateModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiReady || !api) return;

    const fetchModules = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const modules: ChainStateModule[] = [];
        
        // Get all storage modules from the API
        const apiModules = Object.keys(api.query).sort();
        
        for (const moduleName of apiModules) {
          const methods: ChainStateModule['methods'] = [];
          
          // Skip built-in modules that aren't useful for users
          if (moduleName === '$metadata') {
            continue;
          }
          
          // Get methods for each module
          const moduleEntries = Object.entries(api.query[moduleName]);
          
          for (const [methodName, method] of moduleEntries) {
            if (methodName.startsWith('$')) continue;
            
            // Simplified approach to avoid type errors
            try {
              // Try to detect parameters based on method structure
              let params: { name: string; type: string; isOptional: boolean }[] = [];
              
              // For simple queries without parameters
              if (typeof method === 'function') {
                // Try to access creator metadata if available
                if (method.creator && typeof method.creator === 'object') {
                  // Attempt to determine if this is a map type (needs parameters)
                  try {
                    // This is a simplification - different Substrate versions may have different structures
                    const hasParams = 'meta' in (method.creator as any) && 
                                     (method.creator as any).meta && 
                                     'type' in (method.creator as any).meta &&
                                     ((method.creator as any).meta.type.isMap || (method.creator as any).meta.type.isDoubleMap);
                    
                    if (hasParams) {
                      params.push({
                        name: 'key',
                        type: 'Codec',
                        isOptional: false
                      });
                    }
                  } catch (error) {
                    console.warn(`Error detecting params for ${moduleName}.${methodName}:`, error);
                    // Default to assuming there's a parameter
                    params.push({
                      name: 'key',
                      type: 'Codec',
                      isOptional: true
                    });
                  }
                } else {
                  // Default approach for unknown methods - assume one parameter
                  params.push({
                    name: 'key',
                    type: 'Codec',
                    isOptional: true
                  });
                }
              }
              
              methods.push({
                name: methodName,
                params
              });
            } catch (error) {
              console.warn(`Error processing method ${moduleName}.${methodName}:`, error);
              // Add the method with a generic parameter as fallback
              methods.push({
                name: methodName,
                params: [{
                  name: 'key',
                  type: 'any',
                  isOptional: true
                }]
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
        console.error('Failed to fetch chain state modules:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [api, isApiReady]);

  // Function to execute a query
  const executeQuery = async (module: string, method: string, params: any[] = []) => {
    if (!api || !isApiReady) {
      throw new Error('API not ready');
    }

    try {
      const result = await api.query[module][method](...params);
      return result;
    } catch (error) {
      console.error(`Error executing query ${module}.${method}:`, error);
      throw error;
    }
  };

  return { modules, isLoading, error, executeQuery };
};