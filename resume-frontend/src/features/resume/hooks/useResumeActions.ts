import { useNavigate } from "react-router-dom";
import api from "@/lib/api/axiosClient";
import { toast } from "react-toastify";
import { Resume } from "@/types/shared/resume";

export const useResumeActions = (refetchResumes?: () => void) => {
  const navigate = useNavigate();

  const handleView = (id: number) => {
    const url = `${process.env.REACT_APP_API_URL}/resumes/${id}/view/`;
    window.open(url, "_blank");
  };

  const handleDownload = async (id: number, title: string) => {
    try {
      const response = await api.get(`/resumes/${id}/download/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to download resume.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/resumes/${id}/`);
      toast.success("Resume deleted successfully");
      refetchResumes?.();
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.patch(`/resumes/${id}/`, { resume_status: "ARCHIVED" });
      toast.success("Resume archived");
      refetchResumes?.();
    } catch (error) {
      toast.error("Failed to archive resume");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await api.patch(`/resumes/${id}/`, { resume_status: "PUBLISHED" });
      toast.success("Resume published");
      refetchResumes?.();
    } catch (error) {
      toast.error("Failed to publish resume");
    }
  };

  const handleShare = (id: number) => {
    const shareUrl = `${process.env.REACT_APP_API_URL}/resumes/${id}/view/`;
    navigator.clipboard.writeText(shareUrl).then(
      () => toast.success("Link copied to clipboard"),
      () => toast.error("Failed to copy link")
    );
  };

  const handleFavorite = async (resumeId: number): Promise<Resume> => {
    const response = await api.post(`/resumes/${resumeId}/favorite/`);
    return response.data.resume;
  };  

  return {
    handleView,
    handleDownload,
    handleDelete,
    handleArchive,
    handlePublish,
    handleShare,
    handleFavorite,
  };
};
