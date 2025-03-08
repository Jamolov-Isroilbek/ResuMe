import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import api from "@/services/api";
import { EducationSection } from "@/components/resume/EducationSection";
import { WorkExperienceSection } from "@/components/resume/WorkExperienceSection";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  ResumeStatus,
  PrivacySettings,
  ResumeFormData,
  Resume,
  Education,
  WorkExperience,
  PersonalDetails,
  Skill,
  Award,
} from "@/services/types";
import { CustomErrorBoundary } from "@/components/ErrorBoundary";
import { FormField } from "@/components/resume/FormField";

const CreateEditResume: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = React.useState<ResumeFormData>({
    title: "",
    resume_status: ResumeStatus.DRAFT,
    privacy_setting: PrivacySettings.PRIVATE,
    personal_details: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      website: "",
      github: "",
      linkedin: "",
    },
    education: [],
    work_experience: [],
    skills: [],
    awards: [],
  });

  const { loading, error: fetchError } = useAsync(async () => {
    if (!id) return;
    const response = await api.get<Resume>(`/resumes/${id}/`);
    setFormData(transformResumeData(response.data) as ResumeFormData);
  }, [id]);

  const transformResumeData = (apiData: Resume): ResumeFormData => ({
    title: apiData.title,
    resume_status: Object.values(ResumeStatus).includes(apiData.resume_status)
      ? apiData.resume_status
      : ResumeStatus.DRAFT,
    privacy_setting: apiData.privacy_setting,
    personal_details: {
      first_name: apiData.personal_details.first_name,
      last_name: apiData.personal_details.last_name,
      email: apiData.personal_details.email,
      phone: apiData.personal_details.phone,
      website: apiData.personal_details.website || undefined,
      github: apiData.personal_details.github || undefined,
      linkedin: apiData.personal_details.linkedin || undefined,
    },
    education: apiData.education.map((edu) => ({
      institution: edu.institution,
      major: edu.major || undefined,
      start_date: edu.start_date,
      end_date: edu.end_date || undefined,
      cgpa: edu.cgpa || undefined,
    })),
    work_experience: apiData.work_experience.map((work) => ({
      employer: work.employer,
      role: work.role,
      location: work.location || undefined,
      start_date: work.start_date,
      end_date: work.currently_working ? undefined : work.end_date || undefined,
      currently_working: work.currently_working,
      description: work.description || undefined,
    })),
    skills: apiData.skills.map((skill) => ({
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency: skill.proficiency || undefined,
    })),
    awards: apiData.awards.map((award) => ({
      name: award.name,
      description: award.description || undefined,
      year: award.year,
    })),
  });

  const formatSubmissionData = (data: ResumeFormData) => ({
    ...data,
    education: data.education.map((edu) => ({
      ...edu,
      end_date: edu.end_date || null,
      cgpa: edu.cgpa ? Number(edu.cgpa) : null,
    })),
    work_experience: data.work_experience.map((work) => ({
      ...work,
      end_date: work.currently_working ? null : work.end_date || null,
      location: work.location || null,
      description: work.description || null,
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      console.log("Submitting data:", formData);
      const formattedData = formatSubmissionData(formData);
      console.log("Formatted data:", formattedData);

      const response = isEditing
        ? await api.put(`/resumes/${id}/`, formattedData)
        : await api.post("/resumes/", formattedData);

      console.log("API Response:", response.data);
      navigate("/my-resumes");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Education Handlers
  const handleEducationChange = useCallback((
    index: number,
    field: keyof Education,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index
          ? {
              ...edu,
              [field]:
                field === "cgpa"
                  ? typeof value === "string"
                    ? parseFloat(value)
                    : Number(value)
                  : value,
            }
          : edu
      ),
    }));
  }, []);

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          major: "",
          start_date: new Date().toISOString(),
          end_date: undefined,
          cgpa: undefined,
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Work Experience Handlers
  const handleWorkExperienceChange = (
    index: number,
    field: keyof WorkExperience,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((work, i) =>
        i === index ? { ...work, [field]: value } : work
      ),
    }));
  };

  const addWorkExperience = () => {
    setFormData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          employer: "",
          role: "",
          start_date: new Date().toISOString(),
          currently_working: false,
          description: "",
          location: undefined,
        },
      ],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Edit Resume" : "Create New Resume"}
      </h1>
      <CustomErrorBoundary>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Resume Metadata</h2>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Resume Title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                value={formData.personal_details.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      first_name: e.target.value,
                    },
                  }))
                }
                required
              />
              <FormField
                label="Last Name"
                value={formData.personal_details.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      last_name: e.target.value,
                    },
                  }))
                }
                required
              />
              <FormField
                label="Email"
                value={formData.personal_details.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      email: e.target.value,
                    },
                  }))
                }
                required
                type="email"
              />
              <FormField
                label="Phone"
                value={formData.personal_details.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      phone: e.target.value,
                    },
                  }))
                }
                required
              />
              <FormField
                label="Website"
                value={formData.personal_details.website || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      website: e.target.value,
                    },
                  }))
                }
              />
              <FormField
                label="GitHub"
                value={formData.personal_details.github || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      github: e.target.value,
                    },
                  }))
                }
              />
              <FormField
                label="LinkedIn"
                value={formData.personal_details.linkedin || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      linkedin: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <EducationSection
            education={formData.education.map((edu) => ({
              ...edu,
              end_date: edu.end_date || undefined,
              cgpa: edu.cgpa || undefined,
            }))}
            onAdd={addEducation}
            onChange={handleEducationChange}
            onRemove={removeEducation}
          />

          <WorkExperienceSection
            workExperience={formData.work_experience.map((work) => ({
              ...work,
              end_date: work.currently_working ? undefined : work.end_date,
              location: work.location || undefined,
            }))}
            onAdd={addWorkExperience}
            onChange={handleWorkExperienceChange}
            onRemove={removeWorkExperience}
          />

          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={() => navigate("/my-resumes")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? "Update Resume" : "Create Resume"}
            </Button>
          </div>
        </form>
      </CustomErrorBoundary>
    </div>
  );
};

export default CreateEditResume;
