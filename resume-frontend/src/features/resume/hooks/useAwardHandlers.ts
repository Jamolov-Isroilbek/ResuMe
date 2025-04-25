import { useCallback } from "react";
import { Award, ResumeFormData } from "@/types/shared/resume";

export const useAwardHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>
) => {
  const handleChange = useCallback(
    (index: number, field: keyof Award, value: string | number | undefined) => {
      setFormData((prev) => ({
        ...prev,
        awards: prev.awards.map((award, i) =>
          i === index ? { ...award, [field]: value } : award
        ),
      }));
    },
    []
  );

  const add = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          name: "",
          description: "",
          year: new Date().getFullYear(),
        },
      ],
    }));
  }, []);

  const remove = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  }, []);

  return { handleChange, add, remove };
};