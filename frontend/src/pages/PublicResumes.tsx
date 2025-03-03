import React, { useEffect, useState } from "react";
import api from "../services/api";
import ViewResumeButton from "../components/ViewResumeButton";

interface PublicResume {
  id: number;
  title: string;
  user: {
    username: string;
  };
}

const PublicResumes: React.FC = () => {
  const [publicResumes, setPublicResumes] = useState<PublicResume[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPublicResumes = async () => {
      try {
        const response = await api.get("/public-resumes/");
        setPublicResumes(response.data);
      } catch (error) {
        console.error("Failed to fetch public resumes:", error);
      }
    };
    fetchPublicResumes();
  }, []);

  const filteredResumes = publicResumes.filter((resume) => {
    const title = resume.title || "";
    const username = resume.user?.username || "";
    
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold text-center mb-4">Public Resumes</h2>

      <input
        type="text"
        placeholder="Search by title or username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.length > 0 ? (
          filteredResumes.map((resume) => (
            <ViewResumeButton
              key={resume.id}
              resumeId={resume.id}
              className="p-4 bg-white shadow-md rounded-lg hover:bg-gray-100 transition cursor-pointer text-left"
            >
              <h3 className="text-xl font-semibold">{resume.title}</h3>
              <p className="text-gray-600">By {resume.user.username}</p>
            </ViewResumeButton>
          ))
        ) : (
          <p className="text-center text-gray-500">No public resumes found.</p>
        )}
      </div>
    </div>
  );
};

export default PublicResumes;