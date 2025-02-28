import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

const PublicResumes: React.FC = () => {
  const [publicResumes, setPublicResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicResumes = async () => {
      try {
        console.log("👨‍💻 Starting to fetch public resumes..."); // ADD THIS LINE
        const response = await api.get("/public-resumes/");
        console.log("✅ Public resumes fetched successfully:", response.data); // ADD THIS LINE
        setPublicResumes(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch public resumes:", error);
        console.error("Detailed error:", error); // ADD THIS LINE - to see more details about the error
      }
    };
    fetchPublicResumes();
  }, []);

  const filteredResumes = publicResumes.filter(
    (resume: any) => {
      const title = resume.title || "";
      const username = resume.user?.username || "";
      
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  );

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold text-center mb-4">Public Resumes</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title or username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-6"
      />

      {/* Resume List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.length > 0 ? (
          filteredResumes.map((resume: any) => (
            <div 
                key={resume.id} 
                className="p-4 bg-white shadow-md rounded-lg mb-4 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/resume/${resume.id}`)}
            >
                <h3 className="text-xl font-semibold">{resume.title}</h3>
                <p className="text-gray-600">By {resume.user.username}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No public resumes found.</p>
        )}
      </div>
    </div>
  );
};

export default PublicResumes;
