import { ResumeFormData, ResumeStatus } from "@/types/shared/resume";

interface ValidationError {
  field: string; // Used to scroll or highlight inputs
  message: string;
}

export const validateResumeData = (data: ResumeFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // For all resumes (draft or published), title is required
  if (!data.title.trim()) {
    errors.push({
      field: "title",
      message: data.resume_status === ResumeStatus.PUBLISHED
        ? "Resume title is required."
        : "Resume title is required even for drafts",
    });
  }
  
  // If not PUBLISHED, only validate title
  if (data.resume_status !== ResumeStatus.PUBLISHED) {
    return errors;
  }

  // === Personal Details (required for PUBLISHED only) ===
  const { first_name, last_name, email, phone } = data.personal_details;

  if (!first_name?.trim()) {
    errors.push({
      field: "personal_details",
      message: "First name is required",
    });
  }

  if (!last_name?.trim()) {
    errors.push({
      field: "personal_details",
      message: "Last name is required",
    });
  }

  if (!email?.trim()) {
    errors.push({
      field: "personal_details",
      message: "Email is required",
    });
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({
      field: "personal_details",
      message: "A valid email address is required.",
    });
  }

  if (!phone?.trim()) {
    errors.push({
      field: "personal_details",
      message: "Phone number is required",
    });
  } else if (!/^\+?\d{7,15}$/.test(phone)) {
    errors.push({
      field: "personal_details",
      message: "A valid phone number is required.",
    });
  }

  // === Education (required for PUBLISHED only) ===
  if (!data.education || data.education.length === 0) {
    errors.push({
      field: "education",
      message: "At least one education entry is required",
    });
  } else {
    data.education.forEach((edu, index) => {
      if (!edu.institution?.trim()) {
        errors.push({
          field: "education",
          message: `Education entry ${index + 1} is missing the institution name.`,
        });
      }
      if (!edu.start_date?.trim()) {
        errors.push({
          field: "education",
          message: `Education entry ${index + 1} is missing the start date.`,
        });
      }
      if (!edu.major?.trim()) {
        errors.push({
          field: "education",
          message: `Education entry ${index + 1} is missing the major.`,
        });
      }
    });
  }

  // === Work Experience OR Projects (at least one required for PUBLISHED) ===
  const hasWorkExperience = data.work_experience && data.work_experience.length > 0;
  const hasProjects = data.projects && data.projects.length > 0;
  
  if (!hasWorkExperience && !hasProjects) {
    errors.push({
      field: "experience",
      message: "At least one work experience or project entry is required",
    });
  }
  
  if (hasWorkExperience) {
    data.work_experience.forEach((work, index) => {
      if (!work.employer?.trim()) {
        errors.push({
          field: "work_experience",
          message: `Work experience entry ${index + 1} is missing the employer name.`,
        });
      }
      if (!work.role?.trim()) {
        errors.push({
          field: "work_experience",
          message: `Work experience entry ${index + 1} is missing the role.`,
        });
      }
      if (!work.start_date?.trim()) {
        errors.push({
          field: "work_experience",
          message: `Work experience entry ${index + 1} is missing the start date.`,
        });
      }
    });
  }
  
  if (hasProjects) {
    data.projects.forEach((project, index) => {
      if (!project.title?.trim()) {
        errors.push({
          field: "projects",
          message: `Project entry ${index + 1} is missing the title.`,
        });
      }
      if (!project.start_date?.trim()) {
        errors.push({
          field: "projects",
          message: `Project entry ${index + 1} is missing the start date.`,
        });
      }
    });
  }

  // === Skills (required for PUBLISHED only) ===
  if (!data.skills || data.skills.length === 0) {
    errors.push({
      field: "skills",
      message: "At least one skill is required",
    });
  }

  return errors;
};