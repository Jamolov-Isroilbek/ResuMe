// src/components/resume/ResumeCard.tsx
import { ActionMenu } from "@/features/resume/components/resume-card/ActionMenu";
import { ResumeStatus, Resume } from "@/types/shared/resume";
import { cn } from "@/lib/utils/helpers";
import { getPrivacyColor } from "../../constants/styles";

interface ResumeCardProps {
  resume: Resume;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload: () => void;
  onArchive?: () => void;
  onPublish?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  ownResume?: boolean;
  displayMode?: "my" | "public" | "dashboard";
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onArchive,
  onPublish,
  onFavorite,
  onShare,
  ownResume = false,
  displayMode = "my",
}) => {
  const getStatusColor = () => {
    switch (resume.resume_status) {
      case ResumeStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800";
      case ResumeStatus.PUBLISHED:
        return "bg-green-100 text-green-800";
      case ResumeStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-between cursor-pointer"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (!(e.target as HTMLElement).closest(".action-menu")) {
          onView();
        }
      }}
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold">{resume.title}</h3>
        <div className="flex gap-2 mt-2">
          {displayMode !== "public" && (
            <span
              className={cn(
                "px-2 py-1 rounded-full text-sm",
                getPrivacyColor(resume.privacy_setting)
              )}
            >
              {resume.privacy_setting}
            </span>
          )}
          {displayMode === "dashboard" && (
            <span
              className={cn("px-2 py-1 rounded-full text-sm", getStatusColor())}
            >
              {resume.resume_status}
            </span>
          )}
          {displayMode === "public" && (
            <span className="text-sm text-gray-600">
              By {resume.user?.username ?? "Anonymous"}
            </span>
          )}
        </div>
      </div>
      <div className="action-menu">
        <ActionMenu
          status={resume.resume_status}
          isOwner={ownResume}
          isFavorited={resume.is_favorited}
          onView={onView}
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
          onArchive={onArchive}
          onPublish={onPublish}
          onFavorite={onFavorite}
          onShare={onShare}
        />
      </div>
    </div>
  );
};
