import { InputField } from "../form";
import { ResumeFormData } from "@/types/shared/resume";

export const PersonalDetailsForm = ({
  formData,
  setFormData,
}: {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="First Name"
      value={formData.personal_details.first_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            first_name: e.target.value,
          },
        }))
      }
      required
    />
    <InputField
      label="Last Name"
      value={formData.personal_details.last_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            last_name: e.target.value,
          },
        }))
      }
      required
    />
    <InputField
      label="Email"
      value={formData.personal_details.email}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            email: e.target.value,
          },
        }))
      }
      required
      type="email"
    />
    <InputField
      label="Phone"
      value={formData.personal_details.phone}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            phone: e.target.value,
          },
        }))
      }
      required
    />
    <InputField
      label="Website"
      value={formData.personal_details.website || ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            website: e.target.value,
          },
        }))
      }
    />
    <InputField
      label="GitHub"
      value={formData.personal_details.github || ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            github: e.target.value,
          },
        }))
      }
    />
    <InputField
      label="LinkedIn"
      value={formData.personal_details.linkedin || ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          personal_details: {
            ...prev.personal_details,
            linkedin: e.target.value,
          },
        }))
      }
    />
  </div>
);