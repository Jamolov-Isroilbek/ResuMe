import React from 'react';
import { WorkExperience } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/resume/FormField';
import { months, years, parseDateToMonthYear, monthYearToISO } from '@/utils/dateUtils';

interface WorkExperienceSectionProps {
  workExperience: Array<Omit<WorkExperience, 'id' | 'resume'>>;
  onAdd: () => void;
  onChange: (index: number, field: keyof WorkExperience, value: any) => void;
  onRemove: (index: number) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = React.memo(({
  workExperience,
  onAdd,
  onChange,
  onRemove
}) => {
  const handleDateChange = (index: number, field: 'start_date' | 'end_date', month: string, year: string) => {
    onChange(index, field, monthYearToISO(month, year));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Work Experience</h3>
      
      {workExperience.map((work, index) => {
        const startDate = parseDateToMonthYear(work.start_date);
        const endDate = work.end_date ? parseDateToMonthYear(work.end_date) : { month: '', year: '' };

        return (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <FormField
              label="Employer"
              value={work.employer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(index, 'employer', e.target.value)
              }
              required
            />

            <FormField
              label="Role/Position"
              value={work.role}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(index, 'role', e.target.value)
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <div className="flex gap-2">
                  <select
                    value={startDate.month}
                    onChange={(e) => handleDateChange(index, 'start_date', e.target.value, startDate.year)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={startDate.year}
                    onChange={(e) => handleDateChange(index, 'start_date', startDate.month, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <div className="flex gap-2">
                  <select
                    value={endDate.month}
                    onChange={(e) => handleDateChange(index, 'end_date', e.target.value, endDate.year)}
                    className="w-full p-2 border rounded-md"
                    disabled={work.currently_working}
                  >
                    <option value="">Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={endDate.year}
                    onChange={(e) => handleDateChange(index, 'end_date', endDate.month, e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={work.currently_working}
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={work.currently_working}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(index, 'currently_working', e.target.checked);
                  if (e.target.checked) {
                    onChange(index, 'end_date', null);
                  }
                }}
                className="h-4 w-4"
              />
              <label className="text-sm">Currently working here</label>
            </div>

            <FormField
              label="Location"
              value={work.location || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(index, 'location', e.target.value)
              }
              placeholder="e.g., New York, USA"
            />

            <FormField
              label="Description"
              value={work.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(index, 'description', e.target.value)
              }
              as="textarea"
              className="min-h-[100px]"
            />

            {workExperience.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemove(index)}
              >
                Remove Experience
              </Button>
            )}
          </div>
        );
      })}

      <Button variant="secondary" onClick={onAdd}>
        Add Work Experience
      </Button>
    </div>
  );
});