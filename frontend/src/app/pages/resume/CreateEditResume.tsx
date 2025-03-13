import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "@/lib/hooks/useAsync";
import { Loader, CustomErrorBoundary } from "@/lib/ui/common";
import { FormSection } from "@/features/resume/components/form";
import { 
  ResumeMetadataForm,
  PersonalDetailsForm,
  FormActions
} from "@/features/resume/components/resume-form";
import { 
  EducationSection,
  WorkExperienceSection,
  SkillsSection,
  AwardsSection
} from "@/features/resume/components/sections";
import { 
  useEducationHandlers,
  useWorkExperienceHandlers,
  useSkillHandlers,
  useAwardHandlers,
  useResumeSubmission
} from "@/features/resume/hooks";
import api from "@/lib/api/axiosClient";
import { 
  ResumeFormData,
  ResumeStatus,
  PrivacySettings,
  Resume
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
  resume_status: Object.values(ResumeStatus).includes(apiData.resume_status)
    ? apiData.resume_status
    : ResumeStatus.DRAFT,
  privacy_setting: apiData.privacy_setting,
  personal_details: {
    first_name: apiData.personal_details.first_name,
    last_name: apiData.personal_details.last_name,
    email: apiData.personal_details.email,
    phone: apiData.personal_details.phone,
    website: apiData.personal_details.website || "",
    github: apiData.personal_details.github || "",
    linkedin: apiData.personal_details.linkedin || "",
  },
  education: apiData.education.map((edu) => ({
    institution: edu.institution,
    major: edu.major || "",
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

const CreateEditResume: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [formData, setFormData] = React.useState<ResumeFormData>(initialFormData);

  const { loading } = useAsync(async () => {
    if (!id) return;
    const response = await api.get<Resume>(`/resumes/${id}/`);
    setFormData(transformResumeData(response.data));
  }, [id]);

  const { handleSubmit } = useResumeSubmission(id);
  const educationHandlers = useEducationHandlers(setFormData);
  const workHandlers = useWorkExperienceHandlers(setFormData);
  const skillHandlers = useSkillHandlers(setFormData);
  const awardHandlers = useAwardHandlers(setFormData);

  const handleCancel = () => {
    const userChoice = window.confirm(
      "Do you want to save your changes as a draft before canceling?\n" +
        "Press OK to save as draft, Cancel to discard changes."
    );
    if (userChoice) {
      setFormData((prev) => ({ ...prev, resume_status: ResumeStatus.DRAFT }));
      handleSubmit(formData);
    } else {
      navigate("/my-resumes");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Edit Resume" : "Create New Resume"}
      </h1>
      <CustomErrorBoundary>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }}>
          <FormSection title="Resume Metadata">
            <ResumeMetadataForm formData={formData} setFormData={setFormData} />
          </FormSection>

          <FormSection>
            <PersonalDetailsForm formData={formData} setFormData={setFormData} />
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
              onSubmit={() => {
                setFormData((prev) => ({ ...prev, resume_status: ResumeStatus.PUBLISHED }));
                handleSubmit(formData);
              }}
              onCancel={handleCancel}
              onSaveDraft={() => {
                setFormData((prev) => ({ ...prev, resume_status: ResumeStatus.DRAFT }));
                handleSubmit(formData);
              }}
            />
          </FormSection>
        </form>
      </CustomErrorBoundary>
    </div>
  );
};

export default CreateEditResume;