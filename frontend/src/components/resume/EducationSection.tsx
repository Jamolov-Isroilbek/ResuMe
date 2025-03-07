import React from 'react';
import { Education } from '@/services/types';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/resume/FormField';
import { months, years, parseDateToMonthYear, monthYearToISO } from '@/utils/dateUtils';

interface EducationSectionProps {
  education: Array<Omit<Education, 'id' | 'resume'>>;
  onAdd: () => void;
  onChange: (index: number, field: keyof Education, value: string | number | undefined) => void;
  onRemove: (index: number) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = React.memo(({
  education,
  onAdd,
  onChange,
  onRemove
}) => {
  const handleDateChange = (
    index: number,
    field: 'start_date' | 'end_date',
    month: string,
    year: string
  ) => {
    const isoDate = month && year ? monthYearToISO(month, year) || new Date().toISOString() : '';
    onChange(index, field, isoDate);
  };

  const handleCgpaChange = (index: number, value: string) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    onChange(index, 'cgpa', numericValue);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Education</h3>
      {education.map((edu, index) => {
        const startDate = parseDateToMonthYear(edu.start_date);
        const endDate = edu.end_date ? parseDateToMonthYear(edu.end_date) : { month: '', year: '' };

        return (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <FormField
              label="Institution Name"
              value={edu.institution}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                onChange(index, 'institution', e.target.value)
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Major"
                value={edu.major || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onChange(index, 'major', e.target.value)
                }
                placeholder="e.g., Computer Science"
              />
              <FormField
                label="CGPA"
                value={edu.cgpa?.toString() || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleCgpaChange(index, e.target.value)
                }
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="4.0"
              />
            </div>

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
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {education.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemove(index)}
              >
                Remove Education
              </Button>
            )}
          </div>
        );
      })}
      <Button variant="secondary" onClick={onAdd}>
        Add Education
      </Button>
    </div>
  );
});