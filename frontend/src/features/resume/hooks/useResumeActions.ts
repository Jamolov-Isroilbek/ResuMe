// src/hooks/resume/useResumeActions.ts
import api from "@/lib/api/axiosClient";
import { Resume, ResumeStatus } from "@/types/shared/resume";
import { ENDPOINTS } from "@/lib/api/endpoints";

type ResumeUpdater = (update: (prev: Resume[]) => Resume[]) => void;

export const useResumeActions = (updater?: ResumeUpdater) => {
  const handleView = (resumeId: number) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/resumes/${resumeId}/view/`,
      "_blank"
    );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await api.delete(`/resumes/${id}/`);
        updater?.(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.put(`/resumes/${id}/`, {
        resume_status: ResumeStatus.ARCHIVED,
      });
      updater?.(prev =>
        prev.map(r =>
          r.id === id ? { ...r, resume_status: ResumeStatus.ARCHIVED } : r
        )
      );
    } catch (error) {
      console.error("Failed to archive resume:", error);
      alert("Error archiving resume. Check console for details.");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await api.put(`/resumes/${id}/`, {
        resume_status: ResumeStatus.PUBLISHED,
      });
      updater?.(prev =>
        prev.map(r =>
          r.id === id ? { ...r, resume_status: ResumeStatus.PUBLISHED } : r
        )
      );
    } catch (error) {
      console.error("Failed to publish resume:", error);
      alert("Error publishing resume. Check console for details.");
    }
  };

  const handleDownload = async (resumeId: number, resumeTitle: string) => {
    try {
      const response = await api.get(ENDPOINTS.DOWNLOAD_RESUME(resumeId), {
        responseType: "blob",
      });
      const fileBlob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `${resumeTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Failed to download resume:", error);
      alert("Error downloading resume. Check console for details.");
    }
  };

  const handleShare = async (resumeId: number) => {
    const shareUrl = `${process.env.REACT_APP_API_URL}/resumes/${resumeId}/view/`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Error sharing resume.");
    }
  };

  const handleFavorite = async (
    resumeId: number,
    updater?: (updateFn: (prev: Resume[]) => Resume[]) => void
  ) => {
    try {
      const response = await api.post(ENDPOINTS.FAVORITE(resumeId));
  
      updater?.(prev => 
        prev.map(resume => 
          resume.id === resumeId
            ? { ...resume, is_favorited: response.data.is_favorited }
            : resume
        )
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      alert("Error toggling favorite.");
    }
  };

  return {
    handleView,
    handleDelete,
    handleArchive,
    handlePublish,
    handleDownload,
    handleShare,
    handleFavorite,
  };
};