import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/axiosClient';
import { Resume } from '@/types/shared/resume';

interface ResumeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resume[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ResumeListResponse>('/resumes/', {
        params: { page: pagination.page, page_size: pagination.pageSize }
      });
      setResumes(response.data.results);
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  const deleteResume = useCallback(async (id: number) => {
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(prev => prev.filter(resume => resume.id !== id));
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Failed to delete resume');
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return { resumes, loading, error, deleteResume, fetchResumes };
};