import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api/axiosClient";
import { formatDate } from "@/lib/utils/dateUtils";
import { ResumeFormData, ResumeStatus } from "@/types/shared/resume";

export const useResumeSubmission = (id?: string) => {
  const navigate = useNavigate();

  const formatSubmissionData = useCallback((data: ResumeFormData) => ({
    ...data,
    education: data.education.map(edu => ({
      ...edu,
      start_date: formatDate(edu.start_date),
      end_date: formatDate(edu.end_date),
      cgpa: edu.cgpa ? Number(edu.cgpa) : null,
    })),
    work_experience: data.work_experience.map(work => ({
      ...work,
      start_date: formatDate(work.start_date),
      end_date: work.currently_working ? null : formatDate(work.end_date),
      location: work.location || null,
      description: work.description || null,
    })),
  }), []);

  const submit = useCallback(async (formData: ResumeFormData) => {
    const formattedData = formatSubmissionData(formData);
    return id 
      ? api.put(`/resumes/${id}/`, formattedData)
      : api.post("/resumes/", formattedData);
  }, [id, formatSubmissionData]);

  const handleSubmit = useCallback(async (formData: ResumeFormData) => {
    try {
      await submit(formData);
      navigate("/my-resumes");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to save. Check console for details.");
    }
  }, [submit, navigate]);

  return { handleSubmit };
};