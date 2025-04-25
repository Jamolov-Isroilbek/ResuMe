import { InputField } from "@/features/resume/components/form";
import { PersonalDetails, ResumeFormData } from "@/types/shared/resume";

interface PersonalDetailsSectionProps {
  details: ResumeFormData["personal_details"];
  onChange: (field: keyof PersonalDetails, value: string) => void;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  details,
  onChange
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="First Name"
      value={details.first_name}
      onChange={(e) => onChange("first_name", e.target.value)}
      required
    />
    {/* Repeat for other fields */}
  </div>
);