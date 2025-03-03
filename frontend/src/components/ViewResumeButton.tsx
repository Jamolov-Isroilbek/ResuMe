// import React from 'react';
// import api from '../services/api';

// type ViewResumeButtonProps = {
//   resumeId: number;
//   className?: string;
//   children?: React.ReactNode;
// };

// const ViewResumeButton: React.FC<ViewResumeButtonProps> = ({ 
//   resumeId, 
//   className = 'text-blue-500 hover:underline',
//   children = 'View Resume'
// }) => {
//   const handleClick = async () => {
//     let newWindow: Window | null = null;
    
//     try {
//       // Open new tab immediately to avoid popup blockers
//       newWindow = window.open('', '_blank');
//       if (!newWindow) {
//         alert('Please allow popups to view resumes');
//         return;
//       }

//       // Verify permissions in original tab
//       const token = localStorage.getItem('token');
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};
//       await api.get(`/resumes/${resumeId}/`, { headers });

//       // Update new tab location after successful verification
//       newWindow.location.href = `http://localhost:8000/api/resumes/${resumeId}/view/`;
//     } catch (error: any) {
//       // Clean up the new tab if there's an error
//       newWindow?.close();
//       alert(`Error opening resume: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   return (
//     <button
//       onClick={handleClick}
//       className={className}
//       aria-label={`Open resume ${resumeId} in new tab`}
//     >
//       {children}
//     </button>
//   );
// };

// export default ViewResumeButton;

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
    
    try {
      if (!newWindow) {
        alert('Please allow popups to view resumes');
        return;
      }

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.get(`/resumes/${resumeId}/`, { headers });

      newWindow.location.href = `http://localhost:8000/api/resumes/${resumeId}/view/`;
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