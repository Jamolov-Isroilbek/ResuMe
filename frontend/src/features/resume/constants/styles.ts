// src/constants/style.ts
import { ResumeStatus, PrivacySettings } from "@/types/shared/resume";
export const colors = {
  primary: "#2563eb",
  secondary: "#4f46e5",
  danger: "#dc2626",
  success: "#16a34a",
  warning: "#ea580c",
};

export const statusColors: Record<ResumeStatus, string> = {
  [ResumeStatus.DRAFT]: "bg-yellow-100 text-yellow-800",
  [ResumeStatus.PUBLISHED]: "bg-green-100 text-green-800",
  [ResumeStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
};

export const privacyColors = {
  PUBLIC: "bg-green-100 text-green-800",
  PRIVATE: "bg-red-100 text-red-800",
};

export const getPrivacyColor = (privacy: PrivacySettings) => {
  return privacy === PrivacySettings.PRIVATE
    ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
    : "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300";
};
