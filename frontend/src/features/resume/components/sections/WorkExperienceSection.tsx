import React from "react";
import { WorkExperience } from "@/types/shared/resume";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
import { parseDateToMonthYear, monthYearToISO } from "@/lib/utils/dateUtils";
import { DateSelect } from "@/features/resume/components/form/DateSelect";

interface WorkExperienceSectionProps {
  workExperience: Array<Omit<WorkExperience, "id" | "resume">>;
  onAdd: () => void;
  onChange: (index: number, field: keyof WorkExperience, value: any) => void;
  onRemove: (index: number) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> =
  React.memo(({ workExperience, onAdd, onChange, onRemove }) => {
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

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Work Experience</h3>

        {workExperience.map((work, index) => {
          const startDate = parseDateToMonthYear(work.start_date);
          const endDate = work.end_date
            ? parseDateToMonthYear(work.end_date)
            : { month: "", year: "" };

          return (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <InputField
                label="Employer"
                value={work.employer}
                onChange={(e) => onChange(index, "employer", e.target.value)}
                required
              />

              <InputField
                label="Role/Position"
                value={work.role}
                onChange={(e) => onChange(index, "role", e.target.value)}
                required
              />

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
                  disabled={work.currently_working}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={work.currently_working}
                  onChange={(e) => {
                    onChange(index, "currently_working", e.target.checked);
                    onChange(
                      index,
                      "end_date",
                      e.target.checked ? null : new Date().toISOString()
                    );
                  }}
                  className="h-4 w-4"
                />
                <label className="text-sm">Currently working here</label>
              </div>

              <InputField
                label="Location"
                value={work.location || ""}
                onChange={(e) => onChange(index, "location", e.target.value)}
                placeholder="e.g., New York, USA"
              />

              <InputField
                label="Description"
                value={work.description || ""}
                onChange={(e) => onChange(index, "description", e.target.value)}
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
