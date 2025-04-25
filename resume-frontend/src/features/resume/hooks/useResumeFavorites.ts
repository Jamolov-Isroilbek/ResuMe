import { useCallback } from "react";
import axiosClient from "@/lib/api/axiosClient";
import { useQueryClient } from "@tanstack/react-query";

export const useResumeFavorites = () => {
  const queryClient = useQueryClient();

  const toggleFavorite = async (resumeId: number) => {
    try {
      const response = await axiosClient.post(
        `/resumes/${resumeId}/favorite/`,
        {}
      );
      console.log("useResumeFavorites - API Response:", response.data); // <--- HERE

      queryClient.setQueryData(["resume", resumeId], response.data.resume);
      console.log("useResumeFavorites - Cache update for ['resume', resumeId]:", queryClient.getQueryData(["resume", resumeId])); // <--- HERE

      queryClient.setQueryData(["resumes"], (old: any) =>
        old?.map((r: any) => (r.id === resumeId ? response.data.resume : r))
      );
      console.log("useResumeFavorites - Cache update for ['resumes']:", queryClient.getQueryData(["resumes"])); // <--- HERE

      queryClient.setQueryData(["public-resumes"], (old: any) =>
        old?.map((r: any) => (r.id === resumeId ? response.data.resume : r))
      );
      console.log("useResumeFavorites - Cache update for ['public-resumes']:", queryClient.getQueryData(["public-resumes"])); // <--- HERE

    } catch (error) {
      console.error("Favorite toggle failed:", error);
    }
  };

  return { toggleFavorite };
};