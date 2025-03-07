// SkillsSection.tsx
import React from "react";
import { Skill, SkillType } from "@/services/types";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/resume/FormField";

interface SkillsSectionProps {
  skills: Skill[];
  onChange: (index: number, field: keyof Skill, value: string) => void;
  onAdd: () => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(
  ({ skills, onChange, onAdd }) => {
    const skillTypeLabels = {
      [SkillType.TECHNICAL]: "Technical Skill",
      [SkillType.SOFT]: "Soft Skill",
      [SkillType.LANGUAGE]: "Language",
      [SkillType.OTHER]: "Other Skill",
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Skills</h3>

        {skills.map((skill, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <FormField
              label="Skill Name"
              value={skill.skill_name}
              onChange={(
                e: React.ChangeEvent<HTMLTextAreaElement> // Add explicit type
              ) => onChange(index, "skill_name", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                value={skill.skill_type}
                onChange={(e) =>
                  onChange(index, "skill_type", e.target.value as SkillType)
                }
              >
                {Object.values(SkillType).map((type) => (
                  <option key={type} value={type}>
                    {skillTypeLabels[type]}
                  </option>
                ))}
              </select>

              <FormField
                label="Proficiency"
                value={skill.proficiency || ""}
                onChange={(
                  e: React.ChangeEvent<HTMLTextAreaElement> // Add explicit type
                ) => onChange(index, "proficiency", e.target.value)}
              />
            </div>
          </div>
        ))}

        <Button variant="secondary" onClick={onAdd}>
          Add Skill
        </Button>
      </div>
    );
  }
);
