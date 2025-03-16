import axiosClient from "@/lib/api/axiosClient";
import { Resume, ResumeStatus } from "@/types/shared/resume";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";

type ResumeUpdater = (update: (prev: Resume[]) => Resume[]) => void;

export const useResumeActions = (sortOption?: string, updater?: ResumeUpdater) => {
  const queryClient = useQueryClient();

  const handleView = async (resumeId: number) => {
    try {
      await axiosClient.post(`/resumes/${resumeId}/view`);
    } catch (error) {
      console.error("Failed to update view count:", error);
    }
    window.open(
      `${process.env.REACT_APP_API_URL}/resumes/${resumeId}/view/`,
      "_blank"
    );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await axiosClient.delete(`/resumes/${id}/`);
        updater?.(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await axiosClient.put(`/resumes/${id}/`, {
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
      await axiosClient.put(`/resumes/${id}/`, {
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
      const response = await axiosClient.get(ENDPOINTS.DOWNLOAD_RESUME(resumeId), {
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

  const handleFavorite = async (resumeId: number) => {
    const queryKey = ['public-resumes', sortOption]; // Use sortOption here

    await queryClient.cancelQueries({ queryKey });

    const previousResumes = queryClient.getQueryData<Resume[]>(queryKey);

    // Optimistic update
    queryClient.setQueryData(queryKey, (old: Resume[] | undefined) =>
      old?.map(resume => ({
        ...resume,
        is_favorited: resume.id === resumeId ? !resume.is_favorited : resume.is_favorited
      }))
    );

    try {
      const { data } = await axiosClient.post<{ resume: Resume }>(
        `/resumes/${resumeId}/favorite/`
      );

      // Merge server response with existing cache
      queryClient.setQueryData(queryKey, (old: Resume[] | undefined) =>
        old?.map(r => r.id === resumeId ? {
          ...r,
          ...data.resume,
          is_favorited: data.resume.is_favorited
        } : r)
      );

      // Force a refresh of the public resumes query AFTER the API call and cache update
      queryClient.invalidateQueries({ queryKey: ['public-resumes', sortOption] }); // <--- MOVED HERE

    } catch (err) {
      queryClient.setQueryData(queryKey, previousResumes);
      throw err;
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