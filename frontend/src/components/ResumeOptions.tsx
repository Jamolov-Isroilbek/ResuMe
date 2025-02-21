import React, { useState } from "react";

interface ResumeOptionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

const ResumeOptions: React.FC<ResumeOptionsProps> = ({ onEdit, onDelete, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Three-dot button */}
      <button
        className="text-gray-500 hover:text-gray-700 px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⋮
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 bg-white shadow-md rounded-lg w-32 py-2">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            🗑️ Delete
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
            onClick={() => {
              setIsOpen(false);
              onDownload();
            }}
          >
            📥 Download
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeOptions;
