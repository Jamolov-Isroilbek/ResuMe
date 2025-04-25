import { InputField } from "../form";
import { PrivacySettings, ResumeFormData } from "@/types/shared/resume";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";
import ToggleSwitch from "@/lib/ui/ToggleSwitch";

export const ResumeMetadataForm = ({
  formData,
  setFormData,
}: {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
}) => (
  <div className="grid grid-cols-1 gap-4">
    {/* Resume Title */}
    <InputField
      label="Resume Title"
      value={formData.title}
      placeholder="Software Devloper - Google" // Recommended format
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, title: e.target.value }))
      }
      required
    />
    {/* Privacy Setting */}
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Privacy Setting
        </label>
        <TooltipIcon content="Public resumes may appear in the Public Resumes section and can be viewed by others. Private resumes are only visible to you." />
      </div>
      <ToggleSwitch
        checked={formData.privacy_setting === PrivacySettings.PUBLIC}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            privacy_setting: value
              ? PrivacySettings.PUBLIC
              : PrivacySettings.PRIVATE,
          }))
        }
        labels={{ checked: "Public", unchecked: "Private" }}
      />
      {/* Anonymization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Anonymization
          </label>
          <TooltipIcon content="If enabled, your personal details (e.g., name, contact info) will be hidden in public resumes." />
        </div>
        <ToggleSwitch
          checked={formData.is_anonymized}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, is_anonymized: value }))
          }
          labels={{ checked: "Anonymized", unchecked: "Visible" }}
        />
      </div>
    </div>
  </div>
);
