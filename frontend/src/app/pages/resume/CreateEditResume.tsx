import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "@/lib/hooks/useAsync";
import api from "@/lib/api/axiosClient";
import { 
  WorkExperienceSection, 
  EducationSection,
  SkillsSection,
  AwardsSection
} from "@/features/resume/components/sections";
import { Button } from "@/lib/ui/buttons/Button";
import { Loader, CustomErrorBoundary } from "@/lib/ui/common";
import { formatDate } from "@/lib/utils/dateUtils";
import { InputField, FormCard, FormSection } from "@/features/resume/components/form";
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
  SkillType,
} from "@/types/shared/resume";

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
      // id: skill.id,
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency: skill.proficiency || undefined,
    })),
    awards: apiData.awards.map((award) => ({
      // id: award.id,
      name: award.name,
      description: award.description || undefined,
      year: award.year,
    })),
  });

  const formatSubmissionData = (data: ResumeFormData) => ({
    ...data,
    education: data.education.map((edu) => ({
      ...edu,
      start_date: formatDate(edu.start_date),
      end_date: formatDate(edu.end_date),
      cgpa: edu.cgpa ? Number(edu.cgpa) : null,
    })),
    work_experience: data.work_experience.map((work) => ({
      ...work,
      start_date: formatDate(work.start_date),
      end_date: work.currently_working ? null : formatDate(work.end_date),
      location: work.location || null,
      description: work.description || null,
    })),
  });

  const submitResume = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedData = formatSubmissionData(formData);
      const response = isEditing
        ? await api.put(`/resumes/${id}/`, formattedData)
        : await api.post("/resumes/", formattedData);
      navigate("/my-resumes");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitResume();
  };

  const handleCancel = () => {
    const userChoice = window.confirm(
      "Do you want to save your changes as a draft before canceling?\n" +
        "Press OK to save as draft, Cancel to discard changes."
    );
    if (userChoice) {
      // Save as draft
      setFormData((prev) => ({ ...prev, resume_status: ResumeStatus.DRAFT }));
      submitResume();
    } else {
      // Navigate away without saving
      navigate("/my-resumes");
    }
  };

  // Education Handlers
  const handleEducationChange = useCallback(
    (
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
    },
    []
  );

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

  // Skills Handlers
  const handleSkillChange = (
    index: number,
    field: keyof Skill,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          skill_name: "",
          skill_type: SkillType.OTHER,
          proficiency: undefined,
        },
      ],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Awards Handlers
  const handleAwardChange = (
    index: number,
    field: keyof Award,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.map((award, i) =>
        i === index ? { ...award, [field]: value } : award
      ),
    }));
  };

  const addAward = () => {
    setFormData((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          name: "",
          description: "",
          year: new Date().getFullYear(),
        },
      ],
    }));
  };

  const removeAward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
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
          <FormSection title="Resume Metadata">
            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Resume Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Privacy Setting
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <FormCard className="p-3 flex items-center">
                    <input
                      type="radio"
                      name="privacy_setting"
                      value={PrivacySettings.PUBLIC}
                      checked={
                        formData.privacy_setting === PrivacySettings.PUBLIC
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          privacy_setting: e.target.value as PrivacySettings,
                        }))
                      }
                    />
                    <span className="ml-2">Public</span>
                  </FormCard>
                  <FormCard className="p-3 flex items-center">
                    <input
                      type="radio"
                      name="privacy_setting"
                      value={PrivacySettings.PRIVATE}
                      checked={
                        formData.privacy_setting === PrivacySettings.PRIVATE
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          privacy_setting: e.target.value as PrivacySettings,
                        }))
                      }
                    />
                    <span className="ml-2">Private</span>
                  </FormCard>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={formData.personal_details.first_name}
                onChange={(e) =>
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
              <InputField
                label="Last Name"
                value={formData.personal_details.last_name}
                onChange={(e) =>
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
              <InputField
                label="Email"
                value={formData.personal_details.email}
                onChange={(e) =>
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
              <InputField
                label="Phone"
                value={formData.personal_details.phone}
                onChange={(e) =>
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
              <InputField
                label="Website"
                value={formData.personal_details.website || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      website: e.target.value,
                    },
                  }))
                }
              />
              <InputField
                label="GitHub"
                value={formData.personal_details.github || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personal_details: {
                      ...prev.personal_details,
                      github: e.target.value,
                    },
                  }))
                }
              />
              <InputField
                label="LinkedIn"
                value={formData.personal_details.linkedin || ""}
                onChange={(e) =>
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
          </FormSection>

          <FormSection>
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
          </FormSection>

          <FormSection>
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
          </FormSection>

          <FormSection>
            <SkillsSection
              skills={formData.skills.map((skill) => ({
                ...skill,
                proficiency: skill.proficiency || undefined,
              }))}
              onAdd={addSkill}
              onChange={handleSkillChange}
              onRemove={removeSkill}
            />
          </FormSection>

          <FormSection>
            <AwardsSection
              awards={formData.awards}
              onAdd={addAward}
              onChange={handleAwardChange}
              onRemove={removeAward}
            />
          </FormSection>

          <FormSection>
            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              {(!isEditing ||
                formData.resume_status === ResumeStatus.DRAFT) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      resume_status: ResumeStatus.DRAFT,
                    }));
                    submitResume();
                  }}
                >
                  Save as Draft
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    resume_status: ResumeStatus.PUBLISHED,
                  }));
                  submitResume();
                }}
              >
                {isEditing ? "Update Resume" : "Create Resume"}
              </Button>
            </div>
          </FormSection>
        </form>
      </CustomErrorBoundary>
    </div>
  );
};

export default CreateEditResume;
