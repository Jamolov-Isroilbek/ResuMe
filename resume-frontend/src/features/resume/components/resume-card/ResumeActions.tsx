// features/resume/components/resume-card/ResumeActions.tsx
import { Button } from "@/lib/ui/buttons/Button";
import {
  HeartIcon,
  ShareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "react-tooltip";

interface ResumeActionsProps {
  isOwner: boolean;
  isFavorited?: boolean;
  onDownload: () => void;
  onShare: () => void;
  onFavorite: () => void;
}

export const ResumeActions = ({
  isOwner,
  isFavorited,
  onDownload,
  onShare,
  onFavorite,
}: ResumeActionsProps) => (
  <div className="hidden md:flex items-center gap-3">
    {!isOwner && (
      <Button
        variant="ghost"
        // size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        aria-label={isFavorited ? "Unfavorite" : "Favorite"}
      >
        {isFavorited ? (
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </Button>
    )}

    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onDownload();
      }}
      data-tooltip-id="download-tooltip"
      data-tooltip-content="Download this resume"
      aria-label="Download"
    >
      <Tooltip id="download-tooltip" />

      <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onShare();
      }}
      data-tooltip-id="share-tooltip"
      data-tooltip-content="Copy this resume URL to the clipboard"
      aria-label="Share"
    >
      <Tooltip id="share-tooltip" />
      <ShareIcon className="w-5 h-5 text-gray-600" />
    </Button>
  </div>
);
