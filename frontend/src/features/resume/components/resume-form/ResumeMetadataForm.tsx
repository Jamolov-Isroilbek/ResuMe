import { InputField, FormCard } from "../form";
import { PrivacySettings, ResumeFormData } from "@/types/shared/resume";

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
      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))
      }
      required
    />
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Privacy Setting
      </label>
      <div className="mt-1 flex items-center gap-4">
        {Object.values(PrivacySettings).map((setting) => (
          <FormCard key={setting} className="p-3 flex items-center">
            <input
              type="radio"
              name="privacy_setting"
              value={setting}
              checked={formData.privacy_setting === setting}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  privacy_setting: e.target.value as PrivacySettings,
                }))
              }
            />
            <span className="ml-2">{setting}</span>
          </FormCard>
        ))}
      </div>
    </div>
  </div>
);