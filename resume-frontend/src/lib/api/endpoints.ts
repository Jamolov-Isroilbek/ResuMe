// src/constants/endpoints.ts
export const ENDPOINTS = {
    RESUMES: "/resumes",
    PUBLIC_RESUMES: "/public-resumes",
    PROFILE: "/me",
    DOWNLOAD_RESUME: (id: number) => `/resumes/${id}/download`,
    FAVORITE: (id: number) => `/resumes/${id}/favorite`,
    USER_STATS: '/user/stats/',
  };