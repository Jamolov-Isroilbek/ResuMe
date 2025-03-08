// src/pages/PublicResumes.tsx
import React, { useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import api from "@/services/api";
import { Loader } from "@/components/ui/Loader";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { Resume } from "@/services/types";

interface PublicResumeResponse {
  count: number;
  results: Resume[];
}

const PublicResumes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: response, loading, error } = useAsync(() =>
    api.get<PublicResumeResponse>("/public-resumes/")
  );

  const publicResumes = response?.data.results || [];

  const filteredResumes = publicResumes.filter((resume) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resume.title.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Public Resumes</h2>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500">{error.message}</div>
      ) : filteredResumes.length > 0 ? (
        <div className="space-y-4">
          {filteredResumes.map((resume: Resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onView={() => {
                const url = `${process.env.REACT_APP_API_URL}/resumes/${resume.id}/view/`;
                window.open(url, "_blank");
              }}
              // For public resumes, disable edit, delete, archive, publish actions.
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No public resumes found matching your search.
        </p>
      )}
    </div>
  );
};

export default PublicResumes;
