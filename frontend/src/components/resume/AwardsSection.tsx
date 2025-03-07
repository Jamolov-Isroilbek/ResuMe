import React from 'react';
import { Award } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/resume/FormField';

interface AwardsSectionProps {
  awards: Award[];
  onAdd: () => void;
  onChange: (index: number, field: keyof Award, value: string) => void;
  onRemove: (index: number) => void;
}

export const AwardsSection: React.FC<AwardsSectionProps> = React.memo(({
  awards,
  onAdd,
  onChange,
  onRemove
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">Awards & Certifications</h3>
    
    {awards.map((award, index) => (
      <div key={index} className="border p-4 rounded-lg space-y-4">
        <FormField
          label="Award Name"
          value={award.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onChange(index, 'name', e.target.value)
          }
          required
        />

        <FormField
          label="Description"
          value={award.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            onChange(index, 'description', e.target.value)
          }
          as="textarea"
          className="min-h-[80px]"
        />

        <FormField
          label="Year Received"
          value={award.year}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onChange(index, 'year', e.target.value)
          }
          type="number"
        />

        {awards.length > 1 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(index)}
          >
            Remove Award
          </Button>
        )}
      </div>
    ))}

    <Button variant="secondary" onClick={onAdd}>
      Add Award
    </Button>
  </div>
));