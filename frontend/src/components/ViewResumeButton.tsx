import React from 'react';
import api from '../services/api';

type Props = {
  resumeId: number;
  className?: string;
  children: React.ReactNode;
};

const ViewResumeButton = ({ 
  resumeId, 
  className = 'text-blue-500 hover:underline',
  children 
}: Props) => {
  const handleClick = async () => {
    const newWindow = window.open('', '_blank');
    const token = localStorage.getItem('token');
    
    try {
      if (!newWindow) {
        alert('Please allow popups to view resumes');
        return;
      }
  
      // Include token in the view URL
      const viewUrl = `http://localhost:8000/api/resumes/${resumeId}/view/?token=${token}`;
      newWindow.location.href = viewUrl;
  
    } catch (error: any) {
      newWindow?.close();
      alert(error.response?.data?.error || 'Failed to open resume');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default ViewResumeButton;