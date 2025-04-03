import { InputField, FormCard } from "../form";
import { PrivacySettings, ResumeFormData } from "@/types/shared/resume";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

export const ResumeMetadataForm = ({
  formData,
  setFormData,
}: {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
}) => (
  <div className="grid grid-cols-1 gap-4">
    <InputField
      label="Resume Title"
      value={formData.title}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, title: e.target.value }))
      }
      required
    />
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Privacy Setting
        </label>
        <TooltipIcon content="Public resumes may appear in the Public Resumes section and can be viewed by others. Private resumes are only visible to you." />
      </div>
      <div className="mt-1 flex items-center gap-4">
        {Object.values(PrivacySettings).map((setting) => (
          <FormCard key={setting} className="p-3 flex items-center">
            <input
              type="radio"
              name="privacy_setting"
              value={setting}
              checked={formData.privacy_setting === setting}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  privacy_setting: e.target.value as PrivacySettings,
                }))
              }
            />
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {setting}
            </span>
          </FormCard>
        ))}
      </div>
    </div>
  </div>
);
