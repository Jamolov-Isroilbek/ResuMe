import { useCallback } from "react";
import { Education, ResumeFormData } from "@/types/shared/resume";

export const useEducationHandlers = (setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>) => {
  const handleChange = useCallback((
    index: number,
    field: keyof Education,
    value: string | number | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? {
          ...edu,
          [field]: field === "cgpa" ? Number(value) : value
        } : edu
      )
    }));
  }, []);

  const add = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: "",
        major: "",
        start_date: new Date().toISOString(),
        end_date: undefined,
        currently_studying: false,
        cgpa: undefined,
      }]
    }));
  }, []);

  const remove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }, []);

  return { handleChange, add, remove };
};