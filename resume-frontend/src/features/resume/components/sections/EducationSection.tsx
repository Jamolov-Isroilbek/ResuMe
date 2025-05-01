import React from "react";
import { Education } from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
import { parseDateToMonthYear, monthYearToISO } from "@/lib/utils/dateUtils";
import { DateSelect } from "@/features/resume/components/form/DateSelect";

interface EducationSectionProps {
  education: Array<Omit<Education, "id" | "resume">>;
  onAdd: () => void;
  onChange: (
    index: number,
    field: keyof Education,
    value: string | number | undefined
  ) => void;
  onRemove: (index: number) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = React.memo(
  ({ education, onAdd, onChange, onRemove }) => {
    const handleDateChange = (
      index: number,
      field: "start_date" | "end_date",
      month: string,
      year: string
    ) => {
      const isoDate =
        month && year
          ? monthYearToISO(month, year) || new Date().toISOString()
          : "";
      onChange(index, field, isoDate);
    };

    const handleCgpaChange = (index: number, value: string) => {
      const numericValue = value === "" ? undefined : parseFloat(value);
      onChange(index, "cgpa", numericValue);
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Education</h3>
        {education.map((edu, index) => {
          const startDate = parseDateToMonthYear(edu.start_date);
          const endDate = edu.end_date
            ? parseDateToMonthYear(edu.end_date)
            : { month: "", year: "" };

          return (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <InputField
                label="Institution Name"
                value={edu.institution}
                onChange={(e) => onChange(index, "institution", e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Major"
                  value={edu.major || ""}
                  onChange={(e) => onChange(index, "major", e.target.value)}
                  placeholder="e.g., BSc. Computer Science"
                />
                <InputField
                  label="CGPA"
                  value={edu.cgpa?.toString() || ""}
                  onChange={(e) => handleCgpaChange(index, e.target.value)}
                  type="number"
                  step={0.01}
                  min={0}
                  max={5}
                  placeholder="5.0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DateSelect
                  label="Start Date"
                  month={startDate.month}
                  year={startDate.year}
                  onMonthChange={(m) =>
                    handleDateChange(index, "start_date", m, startDate.year)
                  }
                  onYearChange={(y) =>
                    handleDateChange(index, "start_date", startDate.month, y)
                  }
                />

                <DateSelect
                  label="End Date"
                  month={endDate.month}
                  year={endDate.year}
                  onMonthChange={(m) =>
                    handleDateChange(index, "end_date", m, endDate.year)
                  }
                  onYearChange={(y) =>
                    handleDateChange(index, "end_date", endDate.month, y)
                  }
                  disabled={!edu.end_date}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!edu.end_date}
                  onChange={(e) => {
                    onChange(
                      index,
                      "end_date",
                      e.target.checked ? undefined : new Date().toISOString()
                    );
                  }}
                  className="h-4 w-4"
                />
                <label className="text-sm">Currently Studying</label>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onRemove(index)}
                  size="sm"
                >
                  Remove Education
                </Button>
              </div>
            </div>
          );
        })}
        <Button type="button" variant="secondary" onClick={onAdd}>
          Add Education
        </Button>
      </div>
    );
  }
);
