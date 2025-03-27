// src/types/shared/resume.ts
export enum ResumeStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
  }
  
  export enum PrivacySettings {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC",
  }
  
  export enum SkillType {
    TECHNICAL = "TECHNICAL",
    SOFT = "SOFT",
    LANGUAGE = "LANGUAGE",
    OTHER = "OTHER",
  }
  
  export interface PersonalDetails {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    website?: string;
    github?: string;
    linkedin?: string;
  }
  
  export interface Education {
    institution: string;
    major?: string;
    start_date: string;
    end_date?: string;
    currently_studying: boolean;
    cgpa?: number;
  }
  
  export interface WorkExperience {
    employer: string;
    role: string;
    location?: string;
    start_date: string;
    end_date?: string;
    currently_working: boolean;
    description?: string;
  }
  
  export interface Skill {
    skill_name: string;
    skill_type: SkillType;
    proficiency?: string;
  }
  
  export interface Award {
    name: string;
    description?: string;
    year: number;
  }
  
  export interface Resume {
    id: number;
    user?: {
      id: number;
      username: string;
    } | null;
    title: string;
    created_at: string;
    updated_at: string;
    resume_status: ResumeStatus;
    privacy_setting: PrivacySettings;
    personal_details: PersonalDetails;
    education: Education[];
    work_experience: WorkExperience[];
    skills: Skill[];
    awards: Award[];
    favorite_count?: number;
    is_favorited?: boolean;
    views_count?: number;
    downloads_count?: number;
  }
  
  export interface ResumeFormData extends Omit<Resume, 'id' | 'created_at' | 'updated_at' | 'user'> {
    education: Array<Omit<Education, 'id'>>;
    work_experience: Array<Omit<WorkExperience, 'id'>>;
    skills: Array<Omit<Skill, 'id'>>;
    awards: Array<Omit<Award, 'id'>>;
  }