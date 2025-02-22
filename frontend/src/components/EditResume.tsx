import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

interface Section {
  id?: number;
  title: string;
  content: string;
}

const EditResume: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from URL

  const [formData, setFormData] = useState({
    title: "",
  });

  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get(`/resumes/${id}/`); // Fetch existing resume
        console.log("Fetched Resume:", response.data);

        setFormData({ title: response.data.title });
        setSections(response.data.sections || []);
      } catch (error) {
        console.error("Failed to fetch resume", error);
      }
    };
    fetchResume();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as keyof Section;
    const updatedSections = [...sections];

    updatedSections[index] = {
      ...updatedSections[index],
      [field]: e.target.value,
    };

    setSections(updatedSections);
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "" }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, sections };
      console.log("Submitting updated resume:", payload);

      const response = await api.put(`/resumes/${id}/`, payload); // ✅ Use PUT request instead of POST
      if (response.status === 200) {
        alert("Resume updated successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to update resume", error);
      alert("Error updating resume.");
    }
  };

  return (
    <div>
      <h2>Edit Resume</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title *:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <h3>Sections</h3>
        {sections.map((section, index) => (
          <div key={index}>
            <input
              type="text"
              name="title"
              value={section.title}
              onChange={(e) => handleSectionChange(index, e)}
              placeholder="Section Title"
              required
            />
            <textarea
              name="content"
              value={section.content}
              onChange={(e) => handleSectionChange(index, e)}
              placeholder="Section Content"
              required
            />
            <button type="button" onClick={() => removeSection(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addSection}>
          Add Section
        </button>
        <button type="submit">Update Resume</button>
      </form>
    </div>
  );
};

export default EditResume;
