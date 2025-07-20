import { createClient } from "$/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

export default function useSupabaseQuery<T>(
  cb: (client: ReturnType<typeof createClient>) => Promise<{ data: T }>,
  deps: React.DependencyList = []
) {
  const client = createClient();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the callback to prevent unnecessary re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(cb, deps);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await memoizedCallback(client);
        setData(result.data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [memoizedCallback, client]);

  return { data, error, loading };
}
