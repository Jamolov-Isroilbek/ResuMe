import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Resume {
  id: number;
  title: string;
}

const MyResumes: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);

  const fetchResumes = async () => {
    try {
      const response = await api.get("/resumes/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure auth token is included
        },
      });
      setResumes(response.data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-background text-center p-6">
      <h2 className="text-3xl font-bold text-primary mb-4">My Resumes</h2>
      <Link to="/create-resume" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
        Create New Resume
      </Link>

      {resumes.length === 0 ? (
        <p className="text-textDark mt-4">No resumes found.</p>
      ) : (
        <ul className="mt-6">
          {resumes.map((resume) => (
            <li key={resume.id} className="p-4 bg-white shadow-md rounded-lg mb-4 flex justify-between items-center">
              <span className="text-lg">{resume.title}</span>
              <Link to={`/edit-resume/${resume.id}`} className="text-blue-500 hover:underline">Edit</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyResumes;
