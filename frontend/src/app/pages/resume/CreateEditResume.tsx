import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "@/lib/hooks/useAsync";
import { Loader, CustomErrorBoundary } from "@/lib/ui/common";
import { FormSection } from "@/features/resume/components/form";
import { AIResumeSuggestionsPanel } from "@/features/resume/components/ai-suggestions/AIResumeSuggestionsPanel";
import { TemplateSelector } from "@/features/resume/components/templates/TemplateSelector";
import { validateResumeData } from "@/validation/resumeValidation";
import { toast } from "react-toastify";
import {
  ResumeMetadataForm,
  PersonalDetailsForm,
  FormActions,
} from "@/features/resume/components/resume-form";
import {
  EducationSection,
  WorkExperienceSection,
  SkillsSection,
  AwardsSection,
} from "@/features/resume/components/sections";
import {
  useEducationHandlers,
  useWorkExperienceHandlers,
  useSkillHandlers,
  useAwardHandlers,
  useResumeSubmission,
} from "@/features/resume/hooks";
import api from "@/lib/api/axiosClient";
import {
  ResumeFormData,
  ResumeStatus,
  PrivacySettings,
  Resume,
} from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import ToggleSwitch from "@/lib/ui/ToggleSwitch";

const initialFormData: ResumeFormData = {
  title: "",
  resume_status: ResumeStatus.DRAFT,
  privacy_setting: PrivacySettings.PRIVATE,
  template: "template_classic",
  is_anonymized: false,
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
};

const transformResumeData = (apiData: Resume): ResumeFormData => ({
  title: apiData.title,
  resume_status: apiData.resume_status,
  privacy_setting: apiData.privacy_setting,
  personal_details: { ...apiData.personal_details },
  template: apiData.template ?? "template_classic",
  is_anonymized: apiData.is_anonymized,
  education: apiData.education.map((edu) => ({
    institution: edu.institution,
    major: edu.major || "",
    start_date: edu.start_date,
    end_date: edu.currently_studying ? undefined : edu.end_date,
    currently_studying: edu.currently_studying,
    cgpa: edu.cgpa,
  })),
  work_experience: apiData.work_experience.map((work) => ({
    employer: work.employer,
    role: work.role,
    location: work.location,
    start_date: work.start_date,
    end_date: work.currently_working ? undefined : work.end_date,
    currently_working: work.currently_working,
    description: work.description,
  })),
  skills: apiData.skills.map((skill) => ({
    skill_name: skill.skill_name,
    skill_type: skill.skill_type,
    proficiency: skill.proficiency,
  })),
  awards: apiData.awards.map((award) => ({
    name: award.name,
    description: award.description,
    year: award.year,
  })),
});

const sanitizeResumeData = (data: ResumeFormData): ResumeFormData => ({
  ...data,
  is_anonymized: data.is_anonymized,
  education: data.education.map((edu) => ({
    institution: edu.institution,
    major: edu.major,
    start_date: edu.start_date,
    end_date: edu.end_date,
    currently_studying: edu.currently_studying,
    cgpa: edu.cgpa,
  })),
  work_experience: data.work_experience.map((work) => ({
    employer: work.employer,
    role: work.role,
    location: work.location,
    start_date: work.start_date,
    end_date: work.end_date,
    currently_working: work.currently_working,
    description: work.description,
  })),
  skills: data.skills
    .filter((skill) => skill.skill_name?.trim() && skill.skill_type?.trim())
    .map((skill) => ({
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency: skill.proficiency,
    })),
  awards: data.awards.map((award) => ({
    name: award.name,
    description: award.description,
    year: award.year,
  })),
});

const CreateEditResume: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const sectionRefs = {
    title: React.useRef<HTMLDivElement>(null),
    personal_details: React.useRef<HTMLDivElement>(null),
    education: React.useRef<HTMLDivElement>(null),
    work_experience: React.useRef<HTMLDivElement>(null),
    skills: React.useRef<HTMLDivElement>(null),
  };

  const [formData, setFormData] =
    React.useState<ResumeFormData>(initialFormData);
  const { loading } = useAsync(async () => {
    if (id) {
      const response = await api.get<Resume>(`/resumes/${id}/`);
      setFormData(transformResumeData(response.data));
    }
  }, [id]);

  const { handleSubmit } = useResumeSubmission(id);
  const educationHandlers = useEducationHandlers(setFormData);
  const workHandlers = useWorkExperienceHandlers(setFormData);
  const skillHandlers = useSkillHandlers(setFormData);
  const awardHandlers = useAwardHandlers(setFormData);

  const getSectionFromError = (
    errorField: string
  ): keyof typeof sectionRefs | null => {
    switch (errorField) {
      case "title":
        return "title";
      case "personal_details":
        return "personal_details";
      case "education":
        return "education";
      case "work_experience":
        return "work_experience";
      case "skills":
        return "skills";
      default:
        return null;
    }
  };

  const handleClearForm = () => {
    if (
      window.confirm(
        "Are you sure want to clear the form? All unsaved data will be lost."
      )
    ) {
      setFormData(initialFormData);
    }
  };

  const handleAction = (status: ResumeStatus) => {
    const cleanedData = sanitizeResumeData({
      ...formData,
      resume_status: status,
    });

    if (status === ResumeStatus.PUBLISHED) {
      const errors = validateResumeData(cleanedData);
      console.log("Validation Errors:", errors);

      if (errors.length > 0) {
        const [firstError] = errors;
        toast.error(firstError.message);

        const sectionKey = getSectionFromError(firstError.field);
        if (sectionKey && sectionRefs[sectionKey]) {
          sectionRefs[sectionKey]?.current?.scrollIntoView({
            behavior: "smooth",
          });
        }

        return;
      }
    } else if (status === ResumeStatus.DRAFT) {
      if (!cleanedData.title.trim()) {
        toast.error("Please provide a title for your draft");
        sectionRefs.title?.current?.scrollIntoView({
          behavior: "smooth",
        });
        return;
      }
    }

    handleSubmit(cleanedData)
      .then(() => {
        if (status === ResumeStatus.DRAFT) {
          toast.success("Draft saved successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.success("Resume published successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        navigate("/my-resumes");
      })
      .catch((error) => {
        console.error("Submission error:", error);

        // Extract error message from the response
        let errorMessage = "An error occurred while saving your resume.";

        if (error.response) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (typeof error.response.data === "object") {
            // Handle validation errors that return as an object
            const firstErrorKey = Object.keys(error.response.data)[0];
            if (firstErrorKey) {
              const fieldError = error.response.data[firstErrorKey];
              errorMessage = Array.isArray(fieldError)
                ? `${firstErrorKey}: ${fieldError[0]}`
                : `${firstErrorKey}: ${fieldError}`;
            }
          }
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  };

  const handleCancel = () => {
    const confirmSave = window.confirm(
      "Do you want to save your changes as a draft before canceling?"
    );
    if (confirmSave) handleAction(ResumeStatus.DRAFT);
    else navigate("/my-resumes");
  };

  if (loading) return <Loader />;

  return (
    <div className="resume-builder-container">
      <div className="main-content">
        <div className="relative max-w-7xl mx-auto p-6 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-md dark:shadow-lg transition-colors duration-300">
          <h1 className="text-3xl font-bold mb-6">
            {isEditing ? "Edit Resume" : "Create New Resume"}
          </h1>
          <CustomErrorBoundary>
            <form>
              <FormSection
                title="Resume Metadata"
                tooltip="Recommended title format: Job Title – Company. This is for your reference and won't appear in the final resume."
              >
                <div ref={sectionRefs.title}>
                  <ResumeMetadataForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Choose Resume Template"
                tooltip="Choose a predefined design layout for your resume."
              >
                <TemplateSelector
                  selectedTemplate={formData.template}
                  onChange={(template) =>
                    setFormData((prev) => ({ ...prev, template }))
                  }
                />
              </FormSection>

              <FormSection>
                <div ref={sectionRefs.personal_details}>
                  <PersonalDetailsForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
              </FormSection>

              <FormSection>
                <div ref={sectionRefs.education}>
                  <EducationSection
                    education={formData.education}
                    onAdd={educationHandlers.add}
                    onChange={educationHandlers.handleChange}
                    onRemove={educationHandlers.remove}
                  />
                </div>
              </FormSection>

              <FormSection>
                <div ref={sectionRefs.work_experience}>
                  <WorkExperienceSection
                    workExperience={formData.work_experience}
                    onAdd={workHandlers.add}
                    onChange={workHandlers.handleChange}
                    onRemove={workHandlers.remove}
                  />
                </div>
              </FormSection>

              <FormSection>
                <div ref={sectionRefs.skills}>
                  <SkillsSection
                    skills={formData.skills}
                    onAdd={skillHandlers.add}
                    onChange={skillHandlers.handleChange}
                    onRemove={skillHandlers.remove}
                  />
                </div>
              </FormSection>

              <FormSection>
                <AwardsSection
                  awards={formData.awards}
                  onAdd={awardHandlers.add}
                  onChange={awardHandlers.handleChange}
                  onRemove={awardHandlers.remove}
                />
              </FormSection>

              <FormSection>
                <div className="flex items-center justify-between gap-2 mt-4">
                  {/* Left side */}
                  <Button variant="danger" onClick={handleClearForm}>
                    Clear Form
                  </Button>

                  {/* Right side */}
                  <FormActions
                    isEditing={isEditing}
                    status={formData.resume_status}
                    onSubmit={() => handleAction(ResumeStatus.PUBLISHED)}
                    onSaveDraft={() => handleAction(ResumeStatus.DRAFT)}
                    onCancel={handleCancel}
                  />
                </div>
              </FormSection>
            </form>
          </CustomErrorBoundary>
        </div>
        <AIResumeSuggestionsPanel resumeData={formData} />
      </div>
    </div>
  );
};

export default CreateEditResume;
