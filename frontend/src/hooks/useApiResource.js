import { useCallback, useEffect, useState } from "react";

export function useApiResource(fetcher) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(Array.isArray(result) ? result : []);
    } catch (requestError) {
      setData([]);
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    let active = true;

    async function loadSafely() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (active) setData(Array.isArray(result) ? result : []);
      } catch (requestError) {
        if (!active) return;
        setData([]);
        setError(requestError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSafely();

    return () => {
      active = false;
    };
  }, [fetcher]);

  return { data, error, loading, reload: load };
}
