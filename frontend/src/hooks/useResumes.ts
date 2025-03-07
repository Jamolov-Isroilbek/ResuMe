import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Resume } from '@/services/types';

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/resumes/');
      setResumes(response.data);
    } catch (err) {
      setError('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResume = useCallback(async (id: number) => {
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(prev => prev.filter(resume => resume.id !== id));
    } catch (err) {
      setError('Failed to delete resume');
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return { resumes, loading, error, deleteResume, fetchResumes };
};