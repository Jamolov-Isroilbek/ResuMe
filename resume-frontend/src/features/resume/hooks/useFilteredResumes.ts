// src/features/resume/hooks/useFilteredResumes.ts
import { Resume, ResumeStatus } from "@/types/shared/resume";

export const useFilteredResumes = (resumes: Resume[], activeTab: ResumeStatus) => {
  const filterResumes = (status: ResumeStatus) => 
    resumes.filter((r) => r.resume_status === status);

  const drafts = filterResumes(ResumeStatus.DRAFT);
  const archives = filterResumes(ResumeStatus.ARCHIVED);
  const published = resumes.filter(
    (r) => r.resume_status !== ResumeStatus.DRAFT && 
           r.resume_status !== ResumeStatus.ARCHIVED
  );

  return {
    drafts,
    archives,
    published,
    filteredResumes: activeTab === ResumeStatus.DRAFT ? drafts :
      activeTab === ResumeStatus.ARCHIVED ? archives : published
  };
};