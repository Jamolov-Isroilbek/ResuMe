// features/resume/components/resume-card/ResumeActions.tsx
import { Button } from "@/lib/ui/buttons/Button";
import { HeartIcon, ShareIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

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
  onFavorite
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
          <HeartIcon className="w-5 h-5 text-gray-600" />
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
      aria-label="Download"
    >
      <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onShare();
      }}
      aria-label="Share"
    >
      <ShareIcon className="w-5 h-5 text-gray-600" />
    </Button>
  </div>
);