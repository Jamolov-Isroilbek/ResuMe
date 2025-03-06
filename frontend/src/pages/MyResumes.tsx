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
    setTimeout(async () => { // Add a small delay
      if (!window.confirm("Are you sure you want to delete this resume?")) return;
  
      try {
        console.log("Deleting resume with ID:", id); // Debug log
        await api.delete(`/resumes/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setResumes((prev) => prev.filter((resume) => resume.id !== id));
      } catch (error) {
        console.error("Failed to delete resume", error);
      }
    }, 100);
  };

  const handleDownload = async (id: number) => {
    try {
      console.log("Downloading resume with ID:", id); // Debug log
      const response = await api.get(`/resumes/${id}/download/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
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

  // const handleViewResume = async (resumeId: number) => {
  //   let newWindow: Window | null = null;
    
  //   try {
  //     const token = localStorage.getItem("token");
  //     console.log(`🔍 Token from LocalStrorage:`, token)
  //     const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};

  //     console.log(`🔍 sending headers:`, headers);

  //     newWindow = window.open("", "_blank");
  //     if (!newWindow) {
  //       alert("Please allow popups to view resumes");
  //       return;
  //     }

  //     await api.get(`/resumes/${resumeId}/view/`, { headers });
  //     newWindow.location.href = `http://localhost:8000/api/resumes/${resumeId}/view/`;
  //   } catch (error: any) {
  //     newWindow?.close();
  //     alert("Error opening resume: " + (error.message || "Unknown error"));
  //   }
  // };

  const handleViewResume = async (resumeId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ You need to log in first.");
        return;
      }
  
      console.log(`🔍 Fetching resume preview for ID: ${resumeId}`);
  
      const response = await fetch(`/api/resumes/${resumeId}/view/`, { // Corrected URL - no token in URL
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Correctly send token in header
          'Content-Type': 'application/json' // Or 'text/html' if your backend explicitly sends that
        }
      });
  
      if (!response.ok) {
        if (response.status === 403) {
          alert("❌ Authorization failed. Please ensure you are logged in and have permission to view this resume.");
        } else {
          alert(`❌ Failed to load resume preview. HTTP error! status: ${response.status}`);
        }
        return;
      }
  
      const htmlContent = await response.text(); // Get HTML content from response
  
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        alert("❌ Please allow popups to view resumes.");
        return;
      }
  
      newWindow.document.body.innerHTML = htmlContent; // Set HTML content to new window's body
  
    } catch (error:any) {
      console.error("❌ Error opening resume:", error);
      alert("Error: " + error.message);
    }
  };
  
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
              className="p-4 bg-white shadow-md rounded-lg mb-4 hover:bg-gray-100 transition flex justify-between items-center"
              onClick={() => handleViewResume(resume.id)}
            >
              <h3 className="text-xl font-semibold">{resume.title}</h3>

              <div 
                className="relative"
                ref={dropdownRef}
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(
                      dropdownOpen === resume.id ? null : resume.id
                    );
                  }}
                  className="px-2 hover:bg-gray-200 rounded"
                >
                  ⋮
                </button>

                {dropdownOpen === resume.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md text-left z-50">
                    <Link
                      to={`/${resume.id}/edit`}
                      className="block px-4 py-2 hover:bg-gray-200"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resume.id);
                      }}
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

