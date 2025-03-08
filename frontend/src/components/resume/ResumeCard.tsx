// src/components/resume/ResumeCard.tsx
import React from "react";
import { Resume, ResumeStatus, PrivacySettings } from "@/services/types";
import { ResumeOptionsMenu } from "@/components/resume/ResumeOptionsMenu";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

interface ResumeCardProps {
  resume: Resume;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onPublish?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onPublish,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    onView();
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-between cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center flex-1">
        {/* Drag Handle */}
        <div
          className="mr-2 p-1 cursor-move"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{resume.title}</h3>
          <div className="flex gap-2 mt-1">
            {(resume.resume_status === ResumeStatus.DRAFT || resume.resume_status === ResumeStatus.ARCHIVED) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {resume.resume_status}
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                resume.privacy_setting === PrivacySettings.PRIVATE
                  ? "bg-red-200 text-red-900"
                  : "bg-green-200 text-green-900"
              }`}
            >
              {resume.privacy_setting}
            </span>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="ml-4">
        <ResumeOptionsMenu
          resumeStatus={resume.resume_status}
          onView={onView}
          onEdit={onEdit}
          onDownload={async () => {
            try {
              const response = await api.get(`/resumes/${resume.id}/download/`, {
                responseType: "blob",
              });
              const fileBlob = new Blob([response.data], { type: "application/pdf" });
              const fileURL = URL.createObjectURL(fileBlob);
              const link = document.createElement("a");
              link.href = fileURL;
              link.setAttribute("download", `${resume.title}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(fileURL);
            } catch (error) {
              console.error("Failed to download resume:", error);
              alert("Error downloading resume. Check console for details.");
            }
          }}
          onDelete={onDelete}
          onArchive={onArchive}
          onPublish={onPublish}
        />
      </div>
    </div>
  );
};
