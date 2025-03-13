// src/components/resume/sections/PrivacySettingsSection.tsx
import { RadioGroup } from "@/features/resume/components/form/RadioGroup";
import { PrivacySettings } from "@/types/shared/resume";

interface PrivacySettingsSectionProps {
  value: PrivacySettings;
  onChange: (value: PrivacySettings) => void;
}

const privacyOptions = [
  { value: PrivacySettings.PUBLIC, label: "Public - Visible to everyone" },
  { value: PrivacySettings.PRIVATE, label: "Private - Only visible to you" }
];

export const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  value,
  onChange
}) => (
  <div className="space-y-4 border-b pb-6 mb-6">
    <h3 className="text-xl font-semibold">Visibility Settings</h3>
    <RadioGroup
      options={privacyOptions}
      selectedValue={value}
      onChange={(val) => onChange(val as PrivacySettings)}
    />
  </div>
);