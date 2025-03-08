// src/pages/MyResumes.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ResumeOptionsMenu } from "@/components/resume/ResumeOptionsMenu";
import { useResumes } from "@/hooks/useResumes";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ResumeStatus } from "@/services/types";

interface Resume {
  id: number;
  title: string;
  resume_status: string;
  privacy_setting: string;
}

interface ResumeResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Resume[];
}

const MyResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const { resumes, loading, deleteResume } = useResumes();

  const fetchResumes = async () => {
    try {
      console.log("Starting fetch...");
      const response = await api.get<ResumeResponse>("/resumes/");
      console.log("API Response:", response);
      console.log("Response data type:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));
      // const data = response.data.results || response.data;
      // console.log("Processed data:", data);
      setResumes(response.data.results ?? []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await api.delete(`/resumes/${id}/`);
        setResumes((prev) => prev.filter((resume) => resume.id !== id));
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Resumes</h2>
        <Button variant="primary" onClick={() => navigate("/create-resume")}>
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-between"
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                const baseUrl = process.env.REACT_APP_API_URL;
                if (!baseUrl) {
                  console.error(
                    "API URL is not defined in environment variables."
                  );
                  return;
                }
                const url = `${baseUrl}/resumes/${resume.id}/view/`;
                window.open(url, "_blank");
              }}
            >
              <h3 className="text-xl font-semibold">{resume.title}</h3>
              <div className="flex gap-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    resume.privacy_setting === "PRIVATE"
                      ? "bg-red-200 text-red-900"
                      : "bg-green-200 text-green-900"
                  }`}
                >
                  {resume.privacy_setting}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <ResumeOptionsMenu
                onView={() => {
                  // Use the CRA environment variable:
                  const baseUrl = process.env.REACT_APP_API_URL;
                  if (!baseUrl) {
                    console.error(
                      "API URL is not defined in environment variables."
                    );
                    return;
                  }
                  const url = `${baseUrl}/resumes/${resume.id}/view/`;
                  window.open(url, "_blank");
                }}
                onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
                onDownload={async () => {
                  try {
                    const response = await api.get(
                      `/resumes/${resume.id}/download/`,
                      {
                        responseType: "blob",
                      }
                    );
                    const fileBlob = new Blob([response.data], {
                      type: "application/pdf",
                    });
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
                    alert(
                      "Error downloading resume. Check console for details."
                    );
                  }
                }}
                onDelete={() => handleDelete(resume.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyResumes;
