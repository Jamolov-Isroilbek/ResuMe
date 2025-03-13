// src/components/resume/AwardsSection.tsx
import React from "react";
import { Award } from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
interface AwardsSectionProps {
  awards: Array<Omit<Award, 'id' | 'resume'>>;
  onAdd: () => void;
  onChange: (index: number, field: keyof Award, value: string) => void;
  onRemove: (index: number) => void;
}

export const AwardsSection: React.FC<AwardsSectionProps> = React.memo(
  ({ awards, onAdd, onChange, onRemove }) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Awards & Certifications</h3>
      
      {awards.map((award, index) => (
        <div className="border p-4 rounded-lg space-y-4">
          <InputField
            label="Award Name"
            value={award.name}
            onChange={(e) =>
              onChange(index, "name", e.target.value)
            }
            required
          />

          <InputField
            label="Description"
            value={award.description || ""}
            onChange={(e) =>
              onChange(index, "description", e.target.value)
            }
            as="textarea"
            className="min-h-[80px]"
          />

          <InputField
            label="Year Received"
            value={award.year.toString()}
            onChange={(e) =>
              onChange(index, "year", e.target.value)
            }
            type="number"
          />

          {awards.length > 1 && (
            <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
              Remove Award
            </Button>
          )}
        </div>
      ))}

      <Button variant="secondary" onClick={onAdd}>
        Add Award
      </Button>
    </div>
  )
);
