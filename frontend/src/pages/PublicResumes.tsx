import React, { useEffect, useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ViewResumeButton } from "@/components/resume/ViewResumeButton";

interface PublicResume {
  id: number;
  title: string;
  user: {
    username: string;
  };
}

const PublicResumes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: response, loading, error } = useAsync(() => 
    api.get<PublicResume[]>("/public-resumes/")
  );

  const publicResumes = response?.data;

  const filteredResumes = publicResumes?.filter((resume) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resume.title.toLowerCase().includes(searchLower) ||
      resume.user.username.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Public Resumes</h2>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by title or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500">{error.message}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <ViewResumeButton
              key={resume.id}
              resumeId={resume.id}
              className="group p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {resume.title}
              </h3>
              <p className="text-gray-600">By {resume.user.username}</p>
            </ViewResumeButton>
          ))}
        </div>
      )}

      {!loading && filteredResumes.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No public resumes found matching your search.
        </p>
      )}
    </div>
  );
};

export default PublicResumes;