import { useCallback } from "react";
import { ResumeFormData, Project } from "@/types/shared/resume";

export const useProjectHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>
) => {
  const add = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          technologies: "",
          start_date: new Date().toISOString(),
          currently_working: false,
        },
      ],

    }));
  }, []);

  const remove = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }, []);

  const handleChange = useCallback(
    (index: number, field: keyof Project, value: any) => {
      setFormData((prev) => ({
        ...prev,
        projects: prev.projects.map((project, i) =>
          i === index ? { ...project, [field]: value } : project
        ),
      }));
    },
    []
  );

  return { add, remove, handleChange };
};
