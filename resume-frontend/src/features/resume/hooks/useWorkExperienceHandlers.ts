import { useCallback } from "react";
import { WorkExperience, ResumeFormData } from "@/types/shared/resume";

export const useWorkExperienceHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>
) => {
  const handleChange = useCallback(
    (index: number, field: keyof WorkExperience, value: any) => {
      setFormData((prev) => ({
        ...prev,
        work_experience: prev.work_experience.map((work, i) =>
          i === index ? { ...work, [field]: value } : work
        ),
      }));
    },
    []
  );

  const add = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          employer: "",
          role: "",
          start_date: new Date().toISOString(),
          currently_working: false,
          description: "",
          location: undefined,
        },
      ],
    }));
  }, []);

  const remove = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index),
    }));
  }, []);

  return { handleChange, add, remove };
};