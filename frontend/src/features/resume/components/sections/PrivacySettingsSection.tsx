// src/components/resume/sections/PrivacySettingsSection.tsx
import { RadioGroup } from "@/features/resume/components/form/RadioGroup";
import { PrivacySettings } from "@/types/shared/resume";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

interface PrivacySettingsSectionProps {
  value: PrivacySettings;
  onChange: (value: PrivacySettings) => void;
}

const privacyOptions = [
  { value: PrivacySettings.PUBLIC, label: "Public - Visible to everyone" },
  { value: PrivacySettings.PRIVATE, label: "Private - Only visible to you" },
];

export const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  value,
  onChange,
}) => (
  <div className="space-y-4 border-b pb-6 mb-6">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold">Visibility Settings</h3>
      <TooltipIcon content="Public resumes may be seen by others and listed in search. Private resumes are only visible to you." />
    </div>
    <RadioGroup
      options={privacyOptions}
      selectedValue={value}
      onChange={(val) => onChange(val as PrivacySettings)}
    />
  </div>
);
