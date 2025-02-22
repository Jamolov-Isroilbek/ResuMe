import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface Section {
  title: string;
  content: string;
}

interface CreateResumeProps {
  onResumeCreated: (newResume: { id: number; title: string }) => void;
}

const CreateResume: React.FC<CreateResumeProps> = ({ onResumeCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
  });

  const [sections, setSections] = useState<Section[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedSections = [...sections];
    updatedSections[index][e.target.name as keyof Section] = e.target.value;
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

    const payload = { ...formData, sections };
    console.log("Submitting resume:", JSON.stringify(payload, null, 2));  // Debug payload

    try {
        const response = await api.post("/resumes/", payload);
        if (response.status === 201) {
            alert("Resume created successfully!");
            onResumeCreated(response.data);
            navigate("/");
        }
    } catch (error:any) {
        console.error("Failed to create resume", error.response?.data || error);
        alert("Error: " + (error.response?.data?.detail || "Could not create resume"));
    }
};

  return (
    <div>
      <h2>Create New Resume</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title *:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
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
            <button type="button" onClick={() => removeSection(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addSection}>Add Section</button>
        <button type="submit">Create Resume</button>
      </form>
    </div>
  );
};

export default CreateResume;
