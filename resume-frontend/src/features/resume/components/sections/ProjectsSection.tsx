// ProjectsSection.tsx
import React from "react";
import { Button } from "@/lib/ui/buttons/Button";
import { InputField } from "@/features/resume/components/form/InputField";
import { parseDateToMonthYear, monthYearToISO } from "@/lib/utils/dateUtils";
import { DateSelect } from "@/features/resume/components/form/DateSelect";
import { Project } from "@/types/shared/resume";

interface ProjectsSectionProps {
  projects: Array<Omit<Project, "id" | "resume">>;
  onAdd: () => void;
  onChange: (index: number, field: keyof Project, value: any) => void;
  onRemove: (index: number) => void;
  isRequired: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(
  ({ projects, onAdd, onChange, onRemove, isRequired }) => {
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
        <h3 className="text-xl font-semibold">Projects</h3>

        {projects.map((project, index) => {
          const startDate = parseDateToMonthYear(project.start_date ?? null);
          const endDate = project.end_date
            ? parseDateToMonthYear(project.end_date)
            : { month: "", year: "" };

          return (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <InputField
                label="Project Title"
                value={project.title}
                onChange={(e) => onChange(index, "title", e.target.value)}
                required={isRequired}
              />

              <InputField
                label="Technologies Used"
                value={project.technologies || ""}
                onChange={(e) =>
                  onChange(index, "technologies", e.target.value)
                }
                placeholder="React, TypeScript, Python, etc."
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
                  disabled={!project.end_date}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!project.end_date}
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
                <label className="text-sm">Currently working</label>
              </div>

              <InputField
                label="Description"
                value={project.description || ""}
                onChange={(e) => onChange(index, "description", e.target.value)}
                as="textarea"
                className="min-h-[100px]"
                required={isRequired}
                placeholder="Describe your project, key features, and what you accomplished."
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onRemove(index)}
                  size="sm"
                >
                  Remove Project
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onAdd} className="flex-1">
            Add Project
          </Button>
        </div>
      </div>
    );
  }
);
