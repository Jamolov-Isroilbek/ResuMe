// src/components/resume/ResumeCard.tsx
import { ActionMenu } from "@/features/resume/components/resume-card/ActionMenu";
import { ResumeStatus, Resume } from "@/types/shared/resume";
import { cn } from "@/lib/utils/helpers";
import { getPrivacyColor } from "../../constants/styles";
import {
  HeartIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ResumeActions } from "./ResumeActions";

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
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

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
      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex flex-col w-full`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (
          !(e.target as HTMLElement).closest(".action-menu, .stats-section")
        ) {
          onView();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{resume.title}</h3>
          <div className="flex gap-2 mt-2 items-center">
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
            {displayMode === "public" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  By {resume.user?.username ?? "Anonymous"}
                </span>
                {resume.is_favorited && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                    <HeartIcon className="w-3 h-3" />
                    <span>Favorited</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {displayMode === "public" ? (
          <>
            {/* Inline icons for large screens */}
            <div className="hidden md:flex">
              <ResumeActions
                isOwner={ownResume}
                isFavorited={resume.is_favorited}
                onDownload={onDownload}
                onShare={onShare || (() => {})}
                onFavorite={onFavorite || (() => {})}
              />
            </div>
            {/* Fallback to dropdown menu on small screens */}
            <div className="md:hidden action-menu">
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
                onStats={() => setShowStats((prev) => !prev)}
              />
            </div>
          </>
        ) : (
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
              onStats={() => {
                setShowStats((prev) => !prev);
              }}
            />
          </div>
        )}
      </div>
      {showStats && (
        <div className="stats-section mt-4 border-t pt-4 flex flex-row gap-6 w-full">
          <div className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {resume.views_count || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {resume.downloads_count || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {resume.favorite_count || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
