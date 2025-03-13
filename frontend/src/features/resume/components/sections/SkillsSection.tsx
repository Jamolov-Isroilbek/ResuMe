// src/components/resume/SkillsSection.tsx
import React from "react";
import { Skill, SkillType } from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
interface SkillsSectionProps {
  skills: Array<Omit<Skill, 'id' | 'resume'>>;
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
          <div className="border p-4 rounded-lg space-y-4">
            <InputField
              label="Skill Name"
              value={skill.skill_name}
              onChange={(e) =>
                onChange(index, "skill_name", e.target.value)
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                value={skill.skill_type}
                onChange={(e) =>
                  onChange(index, "skill_type", e.target.value as SkillType)
                }
                className="p-2 border rounded-md"
              >
                {Object.values(SkillType).map((type) => (
                  <option key={type} value={type}>
                    {skillTypeLabels[type]}
                  </option>
                ))}
              </select>

              <InputField
                label="Proficiency"
                value={skill.proficiency || ""}
                onChange={(e) =>
                  onChange(index, "proficiency", e.target.value)
                }
                type="text"
                placeholder="e.g., Beginner, Intermediate, Expert"
              />
            </div>

            {skills.length > 1 && (
              <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
                Remove Skill
              </Button>
            )}
          </div>
        ))}

        <Button variant="secondary" onClick={onAdd}>
          Add Skill
        </Button>
      </div>
    );
  }
);
