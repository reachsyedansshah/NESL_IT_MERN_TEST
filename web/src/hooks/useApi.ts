import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  immediate?: boolean;
  cacheTime?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  statusCode?: number;
}

// Cache for storing API responses
const cache = new Map<string, { data: any; timestamp: number; cacheTime: number }>();

export function useApi<T = any>(
  resource: string,
  options: ApiOptions = {}
) {
  const {
    method = 'GET',
    body,
    headers = {},
    immediate = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create cache key based on resource and options
  const getCacheKey = useCallback(() => {
    const key = `${method}:${resource}:${JSON.stringify(body)}:${JSON.stringify(headers)}`;
    return key;
  }, [method, resource, body, headers]);

  // Check if data is cached and not expired
  const getCachedData = useCallback(() => {
    const cacheKey = getCacheKey();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.cacheTime) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      cache.delete(cacheKey);
    }
    
    return null;
  }, [getCacheKey]);

  // Set cached data
  const setCachedData = useCallback((data: T) => {
    const cacheKey = getCacheKey();
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      cacheTime,
    });
  }, [getCacheKey, cacheTime]);

  // Fetch function
  const fetchData = useCallback(async (): Promise<T> => {
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null,
      }));
      return cachedData;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Add query parameters for GET requests
      let url = resource;
      if (method === 'GET' && body) {
        const params = new URLSearchParams(body);
        url = `${resource}?${params.toString()}`;
      }

      // Add base URL for API calls
      if (!url.startsWith('http')) {
        url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}${url}`;
      }

      const response = await fetch(url, requestOptions);
      const responseData: ApiResponse<T> = await response.json();

      setState(prev => ({
        ...prev,
        status: response.status,
        loading: false,
      }));

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      if (responseData.success) {
        const data = responseData.data as T;
        
        // Cache successful responses
        setCachedData(data);
        
        setState(prev => ({
          ...prev,
          data,
          error: null,
        }));

        return data;
      } else {
        throw new Error(responseData.message || 'API request failed');
      }
    } catch (error) {
      // Don't set error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return state.data as T;
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [resource, method, body, headers, getCachedData, setCachedData, state.data]);

  // Execute with retry logic
  const execute = useCallback(async (): Promise<T> => {
    retryCountRef.current = 0;
    
    while (retryCountRef.current < retryCount) {
      try {
        return await fetchData();
      } catch (error) {
        retryCountRef.current++;
        
        if (retryCountRef.current >= retryCount) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
      }
    }
    
    throw new Error('Max retry attempts reached');
  }, [fetchData, retryCount, retryDelay]);

  // Clear cache for this resource
  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    cache.delete(cacheKey);
  }, [getCacheKey]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cache.clear();
  }, []);

  // Refetch data (ignoring cache)
  const refetch = useCallback((): Promise<T> => {
    clearCache();
    return execute();
  }, [clearCache, execute]);

  // Effect for immediate execution
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Error is already handled in execute function
      });
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch,
    clearCache,
    clearAllCache,
  };
}

// Specialized hooks for common operations
export function useGet<T = any>(resource: string, options?: Omit<ApiOptions, 'method'>) {
  return useApi<T>(resource, { ...options, method: 'GET' });
}

export function usePost<T = any>(resource: string, options?: Omit<ApiOptions, 'method'>) {
  return useApi<T>(resource, { ...options, method: 'POST' });
}

export function usePut<T = any>(resource: string, options?: Omit<ApiOptions, 'method'>) {
  return useApi<T>(resource, { ...options, method: 'PUT' });
}

export function useDelete<T = any>(resource: string, options?: Omit<ApiOptions, 'method'>) {
  return useApi<T>(resource, { ...options, method: 'DELETE' });
}

// Export cache for external access
export { cache as apiCache }; 