import { ResumeFormData } from "@/types/shared/resume";

interface ValidationError {
  field: string;      // Used to scroll or highlight inputs
  message: string;
}

export const validateResumeData = (data: ResumeFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // === Resume Metadata ===
  if (!data.title || data.title.trim() === "") {
    errors.push({ field: "title", message: "Resume title is required." });
  }

  // === Personal Details ===
  const { first_name, last_name, email, phone } = data.personal_details;

  if (!first_name || !last_name) {
    errors.push({
      field: "personal_details",
      message: "First and last name are required.",
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
  if (!data.education || data.education.length === 0) {
    errors.push({
      field: "education",
      message: "Please add at least one education entry.",
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

  // === Work Experience ===
  if (!data.work_experience || data.work_experience.length === 0) {
    errors.push({
      field: "work_experience",
      message: "Please add at least one work experience entry.",
    });
  } else {
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

  // === Skills ===
  if (!data.skills || data.skills.length === 0) {
    errors.push({
      field: "skills",
      message: "At least one skill must be added.",
    });
  }

  return errors;
};
