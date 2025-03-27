import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "@/lib/hooks/useAsync";
import { Loader, CustomErrorBoundary } from "@/lib/ui/common";
import { FormSection } from "@/features/resume/components/form";
import { AIResumeSuggestionsPanel } from "@/features/resume/components/ai-suggestions/AIResumeSuggestionsPanel";
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

const initialFormData: ResumeFormData = {
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
};

const transformResumeData = (apiData: Resume): ResumeFormData => ({
  title: apiData.title,
  resume_status: apiData.resume_status,
  privacy_setting: apiData.privacy_setting,
  personal_details: { ...apiData.personal_details },
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

  const handleAction = (status: ResumeStatus) => {
    const cleanedData = sanitizeResumeData({
      ...formData,
      resume_status: status,
    });
    handleSubmit(cleanedData);
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
        <div className="relative max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">
            {isEditing ? "Edit Resume" : "Create New Resume"}
          </h1>
          <CustomErrorBoundary>
            <form>
              <FormSection title="Resume Metadata">
                <ResumeMetadataForm
                  formData={formData}
                  setFormData={setFormData}
                />
              </FormSection>

              <FormSection>
                <PersonalDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                />
              </FormSection>

              <FormSection>
                <EducationSection
                  education={formData.education}
                  onAdd={educationHandlers.add}
                  onChange={educationHandlers.handleChange}
                  onRemove={educationHandlers.remove}
                />
              </FormSection>

              <FormSection>
                <WorkExperienceSection
                  workExperience={formData.work_experience}
                  onAdd={workHandlers.add}
                  onChange={workHandlers.handleChange}
                  onRemove={workHandlers.remove}
                />
              </FormSection>

              <FormSection>
                <SkillsSection
                  skills={formData.skills}
                  onAdd={skillHandlers.add}
                  onChange={skillHandlers.handleChange}
                  onRemove={skillHandlers.remove}
                />
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
                <FormActions
                  isEditing={isEditing}
                  status={formData.resume_status}
                  onSubmit={() => handleAction(ResumeStatus.PUBLISHED)}
                  onSaveDraft={() => handleAction(ResumeStatus.DRAFT)}
                  onCancel={handleCancel}
                />
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
