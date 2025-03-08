// src/services/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_public: boolean;
  profile_picture: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;    // ISO date string
  last_login: string;     // ISO date string
  groups: number[];       // Array of group IDs
  user_permissions: number[]; // Array of permission IDs
}

export interface Group {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  codename: string;
  name: string;
}

export enum ResumeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum PrivacySettings {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export enum SkillType {
  TECHNICAL = 'TECHNICAL',
  SOFT = 'SOFT',
  LANGUAGE = 'LANGUAGE',
  OTHER = 'OTHER'
}

export interface Resume {
  id: number;
  user: User;
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
}

export interface PersonalDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface Education {
  id: number;
  institution: string;
  major?: string;
  start_date: string;  // ISO date string
  end_date?: string;   // ISO date string
  cgpa?: number;
}

export interface WorkExperience {
  id: number;
  employer: string;
  role: string;
  location?: string;
  start_date: string;  // ISO date string
  end_date?: string;   // ISO date string
  currently_working: boolean;
  description?: string;
}

export interface Skill {
  id: number;
  skill_name: string;
  skill_type: SkillType;
  proficiency?: string;
}

export interface Award {
  id: number;
  name: string;
  description?: string;
  year: number;
}

// Form Data Types (for create/update operations)
export interface ResumeFormData {
  title: string;
  resume_status: ResumeStatus;
  privacy_setting: PrivacySettings;
  personal_details: Omit<PersonalDetails, 'id'>;
  education: Array<Omit<Education, 'id' | 'resume'>>;
  work_experience: Array<Omit<WorkExperience, 'id' | 'resume'>>;
  skills: Array<Omit<Skill, 'id' | 'resume'>>;
  awards: Array<Omit<Award, 'id' | 'resume'>>;
}

// API Response Structure
export interface ResumeResponse {
  resume: Resume;
}

export interface ResumeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resume[];
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenPayload {
  refresh: string;
}