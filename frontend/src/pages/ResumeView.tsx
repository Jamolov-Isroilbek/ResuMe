import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const ResumeView: React.FC = () => {
  const { id } = useParams();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

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
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-center mb-4">{resume.title}</h2>

        {/* Personal Details */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold">Personal Details</h3>
          <p>
            <strong>Name:</strong> {resume.personal_details.first_name}{" "}
            {resume.personal_details.last_name}
          </p>
          <p>
            <strong>Email:</strong> {resume.personal_details.email}
          </p>
          <p>
            <strong>Phone:</strong> {resume.personal_details.phone}
          </p>
          {resume.personal_details.website && (
            <p>
              <strong>Website:</strong> {resume.personal_details.website}
            </p>
          )}
          {resume.personal_details.github && (
            <p>
              <strong>GitHub:</strong> {resume.personal_details.github}
            </p>
          )}
          {resume.personal_details.linkedin && (
            <p>
              <strong>LinkedIn:</strong> {resume.personal_details.linkedin}
            </p>
          )}
        </div>

        {/* Education */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold">Education</h3>
          {resume.education.map((edu: any, index: number) => (
            <div key={index} className="mb-2">
              <p>
                <strong>{edu.institution}</strong> ({formatDate(edu.start_date)}{" "}
                - {formatDate(edu.end_date)})
              </p>
              <p>
                Major: {edu.major}, CGPA: {edu.cgpa}
              </p>
            </div>
          ))}
        </div>

        {/* Work Experience */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold">Work Experience</h3>
          {resume.work_experience.map((work: any, index: number) => (
            <div key={index} className="mb-2">
              <p>
                <strong>{work.role}</strong> at {work.employer}
              </p>
              <p>
                {work.start_date} - {work.end_date}
              </p>
              <p>{work.description}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold">Skills</h3>
          <p>
            <strong>Technical:</strong>{" "}
            {resume.skills
              .filter((s: any) => s.skill_type === "TECHNICAL")
              .map((s: any) => s.skill_name)
              .join(", ")}
          </p>
          <p>
            <strong>Soft Skills:</strong>{" "}
            {resume.skills
              .filter((s: any) => s.skill_type === "SOFT")
              .map((s: any) => s.skill_name)
              .join(", ")}
          </p>
          <p>
            <strong>Languages:</strong>{" "}
            {resume.skills
              .filter((s: any) => s.skill_type === "LANGUAGE")
              .map((s: any) => s.skill_name)
              .join(", ")}
          </p>
        </div>

        {/* Awards & Certificates */}
        <div className="pb-4 mb-4">
          <h3 className="text-xl font-semibold">Awards & Certificates</h3>
          {resume.awards.map((award: any, index: number) => (
            <p key={index}>
              <strong>{award.name}</strong> - {award.description} ({award.year})
            </p>
          ))}
        </div>

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
