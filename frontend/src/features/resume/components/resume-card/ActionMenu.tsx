// src/components/core/Cards/ResumeCard/ActionMenu.tsx
import { Button } from "@/lib/ui/buttons/Button";
import { ResumeStatus } from "@/types/shared/resume";
import { cn } from "@/lib/utils/helpers";
import { useState, useRef, useEffect } from "react";

interface ActionMenuProps {
  status: ResumeStatus;
  isOwner: boolean;
  isFavorited?: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onPublish?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export const ActionMenu = ({
  status,
  isOwner,
  isFavorited,
  ...actions
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button 
        variant="secondary" 
        aria-label="More options" 
        className="p-2 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        &#8942;
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-10">
        <button
          onClick={actions.onView}
          className={cn(
            "w-full px-4 py-2 text-left hover:bg-gray-100",
            "text-gray-700"
          )}
        >
          View
        </button>
        
        {isOwner && (
          <>
            {actions.onEdit && (
              <button
                onClick={actions.onEdit}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600"
              >
                Edit
              </button>
            )}
            <button
              onClick={actions.onDownload}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-green-600"
            >
              Download
            </button>
            {status === ResumeStatus.PUBLISHED && actions.onArchive && (
              <button
                onClick={actions.onArchive}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-orange-600"
              >
                Archive
              </button>
            )}
            {status === ResumeStatus.ARCHIVED && actions.onPublish && (
              <button
                onClick={actions.onPublish}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-green-600"
              >
                Publish
              </button>
            )}
            {actions.onShare && (
              <button
                onClick={actions.onShare}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600"
              >
                Share
              </button>
            )}
            {actions.onDelete && (
              <button
                onClick={actions.onDelete}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                Delete
              </button>
            )}
          </>
        )}
        {!isOwner && actions.onFavorite && (
          <button
            onClick={actions.onFavorite}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-purple-600"
          >
            {isFavorited ? "Unfavorite" : "Favorite"}
          </button>
        )}
      </div>
      )}
    </div>
  );
};