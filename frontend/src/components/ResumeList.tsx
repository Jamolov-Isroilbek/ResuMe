import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResumeOptions from "./ResumeOptions";
import CreateResume from "./CreateResume";
import { useNavigate } from "react-router-dom";

interface Resume {
  id: number;
  title: string;
}

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes/");
        setResumes(response.data);
      } catch (error) {
        console.error("Failed to fetch resumes", error);
      }
    };

    fetchResumes();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/resumes/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resumes/${id}/`);
      setResumes((prev) => prev.filter((resume) => resume.id !== id));
      alert("Resume deleted successfully!");
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  const handleDownload = async (id: number) => {
    try {
        const response = await api.get(`/resumes/${id}/download/`, { responseType: "blob" });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download resume", error);
        alert("Error downloading resume. Please try again.");
    }
};


  const handleResumeCreated = (newResume: Resume) => {
    setResumes((prevResumes) => [...prevResumes, newResume]);
    setShowForm(false); // Hide form after resume creation
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {showForm ? "Cancel" : "Create Resume"}
      </button>

      {showForm && <CreateResume onResumeCreated={handleResumeCreated} />}

      {resumes.length === 0 ? (
        <p>No resumes found.</p>
      ) : (
        <ul className="bg-white shadow-md rounded-lg divide-y">
          {resumes.map((resume) => (
            <li key={resume.id} className="p-4 flex justify-between items-center">
              <span className="text-lg font-medium">{resume.title}</span>
              <ResumeOptions
                onEdit={() => handleEdit(resume.id)}
                onDelete={() => handleDelete(resume.id)}
                onDownload={() => handleDownload(resume.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResumeList;
