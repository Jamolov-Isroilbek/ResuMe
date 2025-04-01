import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api/axiosClient";
import { formatDate } from "@/lib/utils/dateUtils";
import { ResumeFormData, ResumeStatus } from "@/types/shared/resume";

export const useResumeSubmission = (id?: string) => {
  const navigate = useNavigate();

  const formatSubmissionData = useCallback(
    (data: ResumeFormData) => ({
      title: data.title,
      resume_status: data.resume_status,
      privacy_setting: data.privacy_setting,
      template: data.template,
      personal_details: {
        first_name: data.personal_details.first_name,
        last_name: data.personal_details.last_name,
        email: data.personal_details.email,
        phone: data.personal_details.phone,
        website: data.personal_details.website || null,
        github: data.personal_details.github || null,
        linkedin: data.personal_details.linkedin || null,
      },
      education: data.education.map((edu) => ({
        institution: edu.institution,
        major: edu.major || null,
        start_date: formatDate(edu.start_date),
        end_date: edu.currently_studying ? null : formatDate(edu.end_date),
        currently_studying: edu.currently_studying,
        cgpa: edu.cgpa ? Number(edu.cgpa) : null,
      })),
      work_experience: data.work_experience.map((work) => ({
        employer: work.employer,
        role: work.role,
        start_date: formatDate(work.start_date),
        end_date: work.currently_working ? null : formatDate(work.end_date),
        currently_working: work.currently_working,
        location: work.location || null,
        description: work.description || null,
      })),
      skills: data.skills.map((skill) => ({
        skill_name: skill.skill_name,
        skill_type: skill.skill_type,
        proficiency: skill.proficiency || null,
      })),
      awards:
        data.awards.map((award) => ({
          name: award.name,
          description: award.description || null,
          year: award.year,
        })) || [],
    }),
    []
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const submit = useCallback(
    async (formData: ResumeFormData) => {
      const formattedData = formatSubmissionData(formData);
      return id
        ? api.put(`/resumes/${id}/`, formattedData)
        : api.post("/resumes/", formattedData);
    },
    [id, formatSubmissionData]
  );

  const handleSubmit = useCallback(
    async (formData: ResumeFormData) => {
      try {
        await submit(formData);
        navigate("/my-resumes");
      } catch (error: any) {
        console.error("Submission failed:", error.response?.data);
        alert(
          `Failed to save: ${
            error.response?.data?.detail || "Check console for details"
          }`
        );
      }
    },
    [submit, navigate]
  );

  return { handleSubmit };
};
