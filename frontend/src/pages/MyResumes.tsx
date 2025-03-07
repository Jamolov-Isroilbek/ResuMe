// src/pages/MyResumes.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '@/hooks/useResumes';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';

const MyResumes = () => {
  const navigate = useNavigate();
  const { resumes, loading, deleteResume } = useResumes();

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await deleteResume(id);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Resumes</h2>
        <Button variant="primary" onClick={() => navigate('/create-resume')}>
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            title={resume.title}
            onEdit={() => navigate(`/edit-resume/${resume.id}`)}
            onDelete={() => handleDelete(resume.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyResumes;