import { ResumeFormData, ResumeStatus } from "@/types/shared/resume";

interface ValidationError {
  field: string; // Used to scroll or highlight inputs
  message: string;
}

export const validateResumeData = (data: ResumeFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (data.resume_status === ResumeStatus.PUBLISHED) {
    // === Resume Metadata ===
    if (!data.title.trim()) {
      errors.push({
        field: "title",
        message: "Resume title is required.",
      });
    }

    // === Personal Details ===
    const { first_name, last_name, email, phone } = data.personal_details;

    if (!data.personal_details.first_name.trim()) {
      errors.push({
        field: "personal_details",
        message: "First name is required",
      });
    }

    if (!data.personal_details.last_name.trim()) {
      errors.push({
        field: "personal_details",
        message: "Last name is required",
      });
    }

    if (!data.personal_details.email.trim()) {
      errors.push({
        field: "personal_details",
        message: "Email is required",
      });
    }

    if (!data.personal_details.phone.trim()) {
      errors.push({
        field: "personal_details",
        message: "Phone number is required",
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push({
        field: "personal_details",
        message: "A valid email address is required.",
      });
    }

    if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
      errors.push({
        field: "personal_details",
        message: "A valid phone number is required.",
      });
    }

    // === Education ===
    if (data.education.length === 0) {
      errors.push({
        field: "education",
        message: "At least one education entry is required",
      });
    } else {
      data.education.forEach((edu, index) => {
        if (!edu.institution?.trim()) {
          errors.push({
            field: "education",
            message: `Education entry ${
              index + 1
            } is missing the institution name.`,
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

    // === Work Experience ===
    if (data.work_experience.length === 0) {
      errors.push({
        field: "work_experience",
        message: "At least one work experience entry is required",
      });
    } else {
      data.work_experience.forEach((work, index) => {
        if (!work.employer?.trim()) {
          errors.push({
            field: "work_experience",
            message: `Work experience entry ${
              index + 1
            } is missing the employer name.`,
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
            message: `Work experience entry ${
              index + 1
            } is missing the start date.`,
          });
        }
      });
    }

    // === Skills ===
    if (data.skills.length === 0) {
      errors.push({
        field: "skills",
        message: "At least one skill is required",
      });
    }
  } else if (data.resume_status === ResumeStatus.DRAFT) {
    if (!data.title.trim()) {
      errors.push({
        field: "title",
        message: "Resume title is required even for drafts",
      });
    }
  }

  return errors;
};
