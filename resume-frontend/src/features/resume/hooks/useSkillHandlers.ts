import { useCallback } from "react";
import { Skill, ResumeFormData, SkillType } from "@/types/shared/resume";

export const useSkillHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>
) => {
  const handleChange = useCallback(
    (index: number, field: keyof Skill, value: string | number | undefined) => {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.map((skill, i) =>
          i === index ? { ...skill, [field]: value } : skill
        ),
      }));
    },
    []
  );

  const add = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          skill_name: "",
          skill_type: SkillType.OTHER,
          proficiency: undefined,
        },
      ],
    }));
  }, []);

  const remove = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  return { handleChange, add, remove };
};