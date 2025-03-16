// src/features/profile/hooks/useUserStats.ts

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/lib/api/axiosClient";

export const useUserStats = () => {
  const [stats, setStats] = useState({ views: 0, downloads: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/user/stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};
