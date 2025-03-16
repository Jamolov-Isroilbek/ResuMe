import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Resume } from "@/types/shared/resume";

export const usePublicResumes = (sortOption: string) => {
  const [publicResumes, setPublicResumes] = useState<Resume[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/public-resumes/", {
        params: { sort: sortOption },
        withCredentials: true, // Ensure cookies are sent if needed
      });
      // If pagination is enabled, response.data will have "results" and "count"
      setPublicResumes(response.data.results);
      setCount(response.data.count);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return { publicResumes, count, isLoading, error, refresh: fetchResumes };
};
