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
      message:
        data.resume_status === ResumeStatus.PUBLISHED
          ? "Resume title is required."
          : "Resume title is required even for drafts",
    });
  }

  // If not PUBLISHED, only validate title
  if (data.resume_status !== ResumeStatus.PUBLISHED) {
    return errors;
  }

  // === Personal Details (required for PUBLISHED only) ===
  const { first_name, last_name, email, phone, website, github, linkedin } =
    data.personal_details;

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
    errors.push({ field: "personal_details", message: "Email is required" });
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

  // Optional URL fields: website, github, linkedin
  const urlFields: { name: string; value: string }[] = [
    { name: "website", value: website || "" },
    { name: "github", value: github || "" },
    { name: "linkedin", value: linkedin || "" },
  ];
  urlFields.forEach(({ name, value }) => {
    if (value?.trim()) {
      try {
        new URL(value);
      } catch {
        const fieldLabels: Record<string, string> = {
          website: "Website",
          github: "GitHub",
          linkedin: "LinkedIn",
        };
        errors.push({
          field: "personal_details",
          message: `${fieldLabels[name]} URL is invalid`,
        });
      }
    }
  });

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

  // === Work Experience OR Projects (at least one required for PUBLISHED) ===
  const hasWorkExperience =
    data.work_experience && data.work_experience.length > 0;
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
          message: `Work experience ${index + 1} is missing the employer name.`,
        });
      }
      if (!work.role?.trim()) {
        errors.push({
          field: "work_experience",
          message: `Work experience ${index + 1} is missing the role.`,
        });
      }
      if (!work.start_date?.trim()) {
        errors.push({
          field: "work_experience",
          message: `Work experience ${index + 1} is missing the start date.`,
        });
      }
    });
  }

  if (!hasWorkExperience && hasProjects) {
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

  // === Skills (optional but if present must have name and type) ===
  data.skills.forEach((skill, index) => {
    if (!skill.skill_name?.trim()) {
      errors.push({
        field: "skills",
        message: `Skill ${index + 1} is missing the name.`,
      });
    }
    if (!skill.skill_type?.trim()) {
      errors.push({
        field: "skills",
        message: `Skill ${index + 1} is missing the type.`,
      });
    }
  });

  return errors;
};

/**
 * Flattens a nested error object (e.g. from server responses) into an array of "field: message" strings.
 */
export const flattenErrors = (data: any): string[] => {
  const msgs: string[] = [];

  const getFieldLabel = (path: string[]): string => {
    const cleanPath = path.filter((p) => isNaN(Number(p)));

    const fieldMap: Record<string, string> = {
      title: "Resume Title",
      "personal_details.first_name": "First Name",
      "personal_details.last_name": "Last Name",
      "personal_details.email": "Email",
      "personal_details.phone": "Phone Number",
      "personal_details.website": "Website URL",
      "personal_details.github": "GitHub URL",
      "personal_details.linkedin": "LinkedIn URL",
      education: "Education",
      work_experience: "Work Experience",
      projects: "Projects",
      skills: "Skills",
    };

    const originalPath = path.join(".");
    const arrayMatch = originalPath.match(/(\w+)\.(\d+)\.(\w+)/);

    if (arrayMatch) {
      const [, section, index, field] = arrayMatch;
      const sectionLabels: Record<string, string> = {
        education: `Education Entry ${Number(index) + 1}`,
        work_experience: `Work Experience ${Number(index) + 1}`,
        projects: `Project ${Number(index) + 1}`,
        skills: `Skill ${Number(index) + 1}`,
        awards: `Award ${Number(index) + 1}`,
      };

      const fieldLabels: Record<string, string> = {
        institution: "Institution",
        major: "Major",
        start_date: "Start Date",
        end_date: "End Date",
        employer: "Employer",
        role: "Role",
        title: "Title",
        skill_name: "Skill Name",
        skill_type: "Skill Type",
      };

      const cleanPathKey = cleanPath.join(".");
      if (fieldMap[cleanPathKey]) {
        return fieldMap[cleanPathKey];
      }

      return `${sectionLabels[section] || section}: ${
        fieldLabels[field] || field.replace(/_/g, " ")
      }`;
    }

    return (
      fieldMap[originalPath] ||
      cleanPath
        .join(" ")
        .replace(/_/g, " ")
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
    );
  };

  const recurse = (obj: any, path: string[] = []) => {
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => recurse(item, [...path, String(idx)]));
    } else if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([key, val]) => recurse(val, [...path, key]));
    } else {
      const friendlyField = getFieldLabel(path);
      msgs.push(`${friendlyField}: ${obj}`);
    }
  };

  recurse(data);
  return msgs;
};
