// src/constants/resume.ts
import { ResumeStatus, PrivacySettings } from "@/types/shared/resume";

export const RESUME_STATUS_LABELS: Record<ResumeStatus, string> = {
  [ResumeStatus.DRAFT]: "Draft",
  [ResumeStatus.PUBLISHED]: "Published",
  [ResumeStatus.ARCHIVED]: "Archived",
};

export const PRIVACY_LABELS: Record<PrivacySettings, string> = {
  [PrivacySettings.PRIVATE]: "Private",
  [PrivacySettings.PUBLIC]: "Public",
};

export const DEFAULT_RESUME_FORM_VALUES = {
  title: "",
  resume_status: ResumeStatus.DRAFT,
  privacy_setting: PrivacySettings.PRIVATE,
  personal_details: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  },
};