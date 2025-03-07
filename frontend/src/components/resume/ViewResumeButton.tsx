import React from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface ViewResumeButtonProps {
  resumeId: number;
  children: React.ReactNode;
  className?: string;
}

export const ViewResumeButton = ({ 
  resumeId,
  children,
  className 
}: ViewResumeButtonProps) => {
  const handleView = async () => {
    try {
      const response = await api.get(`/resumes/${resumeId}/view/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleView}
      className={className}
    >
      {children}
    </Button>
  );
};