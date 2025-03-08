// src/components/resume/ResumeOptionsMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ResumeStatus } from "@/services/types";

interface ResumeOptionsMenuProps {
  resumeStatus: string; // "DRAFT", "PUBLISHED", or "ARCHIVED"
  onView: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onPublish?: () => void;
}

export const ResumeOptionsMenu: React.FC<ResumeOptionsMenuProps> = ({
  resumeStatus,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onArchive,
  onPublish,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant="secondary"
        onClick={() => setOpen(!open)}
        aria-label="More options"
        className="p-2"
      >
        &#8942;
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-md z-10">
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            View
          </button>
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDownload();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Download
          </button>
          {resumeStatus === ResumeStatus.PUBLISHED && onArchive && (
            <button
              onClick={() => {
                onArchive();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-orange-600"
            >
              Archive
            </button>
          )}
          {resumeStatus === ResumeStatus.ARCHIVED && onPublish && (
            <button
              onClick={() => {
                onPublish();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600"
            >
              Publish
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
