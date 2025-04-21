// src/components/resume/SkillsSection.tsx
import React from "react";
import { Skill, SkillType } from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
import { Tooltip } from "react-tooltip";
interface SkillsSectionProps {
  skills: Array<Omit<Skill, "id" | "resume">>;
  onAdd: () => void;
  onChange: (index: number, field: keyof Skill, value: string) => void;
  onRemove: (index: number) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(
  ({ skills, onAdd, onChange, onRemove }) => {
    const skillTypeLabels: { [key in SkillType]: string } = {
      [SkillType.TECHNICAL]: "Technical Skill",
      [SkillType.SOFT]: "Soft Skill",
      [SkillType.LANGUAGE]: "Language",
      [SkillType.OTHER]: "Other Skill",
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Skills</h3>

        {skills.map((skill, index) => (
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Skill Name */}
            <div className="flex-1 min-w-[150px]">
              <InputField
                label="Skill"
                value={skill.skill_name}
                onChange={(e) => onChange(index, "skill_name", e.target.value)}
                hideLabel
                placeholder="e.g., Python"
              />
            </div>

            {/* Skill Type */}
            <div className="min-w-[140px]">
              <select
                value={skill.skill_type}
                onChange={(e) =>
                  onChange(index, "skill_type", e.target.value as SkillType)
                }
                className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
              >
                <option value="" disabled>
                  Type
                </option>
                {Object.values(SkillType).map((type) => (
                  <option key={type} value={type}>
                    {skillTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency */}
            <div className="min-w-[140px]">
              <select
                value={skill.proficiency || ""}
                onChange={(e) => onChange(index, "proficiency", e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
              >
                <option value="" disabled>
                  Proficiency
                </option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>


              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-lg px-2"
                title="Remove Skill"
              >
                ❌
              </button>
            
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={onAdd}>
          Add Skill
        </Button>
      </div>
    );
  }
);
