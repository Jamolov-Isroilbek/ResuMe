import { Button } from "@/lib/ui/buttons/Button";
import { ResumeStatus } from "@/types/shared/resume";

export const FormActions = ({
  isEditing,
  status,
  onSubmit,
  onCancel,
  onSaveDraft,
}: {
  isEditing: boolean;
  status: ResumeStatus;
  onSubmit: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
}) => (
  <div className="flex justify-end gap-4">
    <Button variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
    {(!isEditing || status === ResumeStatus.DRAFT) && (
      <Button type="button" variant="secondary" onClick={onSaveDraft}>
        Save as Draft
      </Button>
    )}
    <Button type="button" variant="primary" onClick={onSubmit}>
      {isEditing ? "Update Resume" : "Create Resume"}
    </Button>
  </div>
);