import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Resume {
  id: number;
  title: string;
}

const MyResumes: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchResumes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to view resumes.");
      navigate("/login");
      return;
    }

    try {
      const response = await api.get("/resumes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resumes/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResumes((prev) => prev.filter((resume) => resume.id !== id));
      alert("Resume deleted successfully!");
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await api.get(`/resumes/${id}/download/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob", // Ensures the response is treated as a file
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("❌ Failed to download resume:", error);
      alert("Could not download the resume.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background text-center p-6">
      <h2 className="text-3xl font-bold text-primary mb-4">My Resumes</h2>
      <Link
        to="/create-resume"
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
      >
        Create New Resume
      </Link>

      {resumes.length === 0 ? (
        <p className="text-textDark mt-4">No resumes found.</p>
      ) : (
        <ul className="mt-6">
          {resumes.map((resume) => (
            <li
              key={resume.id}
              className="p-4 bg-white shadow-md rounded-lg mb-4 hover:bg-gray-100 transition cursor-pointer flex justify-between items-center"
              onClick={() => navigate(`/resume/${resume.id}`)}
              >
              
              <h3 className="text-xl font-semibold">{resume.title}</h3>

              {/* Three-dot menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(
                      dropdownOpen === resume.id ? null : resume.id
                    )
                  }}
                >
                  ⋮
                </button>

                {dropdownOpen === resume.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md text-left">
                    <Link
                      to={`/edit-resume/${resume.id}`}
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resume.id);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyResumes;
