import { useState, useEffect } from "react";
import { useAsync } from "@/lib/hooks/useAsync";
import api from "@/lib/api/axiosClient";
import { Resume, ResumeStatus, PrivacySettings } from "@/types/shared/resume";
import { defaultOrderingMapping } from "@/lib/utils/orderingMapping";

interface PublicResumeResponse {
  count: number;
  results: Resume[];
}

export const usePublicResumes = (sortOption: string) => {
  const [publicResumes, setPublicResumes] = useState<Resume[]>([]);
  const { data: response, loading, error } = useAsync(() =>
    api.get<PublicResumeResponse>(
      `/public-resumes/?ordering=${defaultOrderingMapping[sortOption]}`
    ),
    [sortOption]
  );

  useEffect(() => {
    if (response?.data?.results) {
      setPublicResumes(response.data.results);
    }
  }, [response]);

  return { publicResumes, loading, error };
};