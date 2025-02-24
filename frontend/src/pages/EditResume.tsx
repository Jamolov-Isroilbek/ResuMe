import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Section {
    title: string;
    content: string;
  }

const EditResume: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    personalDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      website: "",
      github: "",
      linkedin: "",
    },
    education: [
      {
        institution: "",
        major: "",
        customMajor: "",
        coursework: "",
        showCoursework: false,
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        cgpa: "",
      },
    ],
    workExperience: [
      {
        employer: "",
        role: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        currentlyWorking: false,
        location: "",
        customLocation: "",
        description: "",
        showMore: false,
        moreInfo: "",
      },
    ],
    skills: {
      technical: "",
      softSkills: "",
      languages: "",
    },
    awards: [
      {
        name: "",
        description: "",
        year: "",
        showAward: false,
      },
    ],
  });

  const [customSections, setCustomSections] = useState<Section[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState({
    website: false,
    github: false,
    linkedin: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/resumes/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setFormData(response.data);
      } catch (error) {
        console.error("Failed to fetch resume", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]); // ✅ Fetch data every time the ID changes

  const handleChange = (section: string, index: number, field: string, value: string | boolean) => {
    setFormData((prev) => {
      const updatedSection = [...(prev as any)[section]];
      updatedSection[index][field] = value;
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/resumes/${id}/`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Resume updated successfully!");
      navigate("/my-resumes");
    } catch (error) {
      console.error("Failed to update resume", error);
    }
  };

  if (loading) {
    return <p className="text-center">Loading resume data...</p>;
  }

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold text-primary mb-4">Edit Resume</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Resume Title */}
        <label className="block">
          Resume Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </label>

        {/* Personal Details */}
        <h3 className="text-xl font-bold">Personal Details</h3>
        <input
          type="text"
          placeholder="First Name"
          value={formData.personalDetails.firstName}
          onChange={(e) =>
            setFormData({
              ...formData,
              personalDetails: { ...formData.personalDetails, firstName: e.target.value },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.personalDetails.lastName}
          onChange={(e) =>
            setFormData({
              ...formData,
              personalDetails: { ...formData.personalDetails, lastName: e.target.value },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.personalDetails.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              personalDetails: { ...formData.personalDetails, email: e.target.value },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.personalDetails.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
            setFormData({
              ...formData,
              personalDetails: { ...formData.personalDetails, phone: value },
            });
          }}
          className="w-full px-4 py-2 border rounded-md"
        />

        {/* Work Experience */}
        <h3 className="text-xl font-bold">Work Experience</h3>
        {formData.workExperience.map((work, index) => (
          <div key={index} className="border p-4 rounded-md mb-4">
            <input
              type="text"
              placeholder="Employer Name"
              value={work.employer}
              onChange={(e) => handleChange("workExperience", index, "employer", e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Role"
              value={work.role}
              onChange={(e) => handleChange("workExperience", index, "role", e.target.value)}
              className="w-full px-4 py-2 border rounded-md mt-2"
            />
          </div>
        ))}

        {/* Skills */}
        <h3 className="text-xl font-bold">Skills</h3>
        <input
          type="text"
          placeholder="Technical Skills"
          value={formData.skills.technical}
          onChange={(e) => setFormData({ ...formData, skills: { ...formData.skills, technical: e.target.value } })}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Soft Skills"
          value={formData.skills.softSkills}
          onChange={(e) => setFormData({ ...formData, skills: { ...formData.skills, softSkills: e.target.value } })}
          className="w-full px-4 py-2 border rounded-md mt-2"
        />

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-md">
          Update Resume
        </button>
      </form>
    </div>
  );
};

export default EditResume;
