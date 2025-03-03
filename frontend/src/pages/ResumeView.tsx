import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const ResumeView: React.FC = () => {
  const { id } = useParams();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("clean_modern");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.get(`/resumes/${id}/`, { headers });
        setResume(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch resume:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();

    window.location.href = `http://localhost:8000/api/resumes/${id}/view/`;
  }, [id]);

  if (loading) return <p className="text-center">Loading resume...</p>;
  if (!resume)
    return <p className="text-center text-red-500">Resume not found.</p>;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get(`/resumes/${id}/download/`, {
        headers,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${resume.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Error downloading resume");
    } finally {
      setIsDownloading(false);
    }

    // window.open(`/api/resumes/${id}/download/`, "_blank");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        {/* <iframe
          src={`/api/resumes/${id}/view/`}
          className="w-full max-w-4xl h-screen border-none"
          title="Resume Preview"
        /> */}

        <p className="text-lg">Redirecting to resume view...</p>

        {/* Download Resume Button */}
        <div className="text-center mt-6 space-x-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isDownloading ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeView;
