// src/hooks/useAsync.ts
import { useState, useEffect, DependencyList } from 'react';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

export const useAsync = <T,>(asyncFunction: () => Promise<T>, dependencies: DependencyList = []): AsyncState<T> => {
  const [state, setState] = useState<Omit<AsyncState<T>, 'refresh'>>({
    data: null,
    loading: true,
    error: null
  });
  // const [refreshCount, setRefreshCount] = useState(0);

  // const refresh = useCallback(() => {
  //   setRefreshCount(prev => prev + 1);
  // }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    
    const execute = async () => {
      try {
        const result = await asyncFunction();
        if (isMounted) {
          setState({
            data: result,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && isMounted) {
          setState({
            data: null,
            loading: false,
            error: error as Error
          });
        }
      }
    };

    execute();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [...dependencies]);

  return { ...state, refresh: () => {} };
};