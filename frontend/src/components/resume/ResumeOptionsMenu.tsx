// src/components/resume/ResumeOptionsMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ResumeOptionsMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export const ResumeOptionsMenu: React.FC<ResumeOptionsMenuProps> = ({
  onView,
  onEdit,
  onDownload,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
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
        onClick={() => setOpen((prev) => !prev)}
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
