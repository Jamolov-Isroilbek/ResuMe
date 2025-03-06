import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

interface Section {
  title: string;
  content: string;
}

const majors = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Other",
];
const locations = ["New York, USA", "London, UK", "Berlin, Germany", "Custom"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = Array.from(
  { length: 50 },
  (_, i) => `${new Date().getFullYear() - i}`
);

const CreateEditResume: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing] = useState(!!id);
  const [resumeVisibility, setResumeVisibility] = useState("PRIVATE");

  const [formData, setFormData] = useState({
    title: "",
    resume_status: "DRAFT",
    privacy_setting: resumeVisibility,
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
      otherSkills: "",
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

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!id) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to login first");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/resumes/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        console.log("✅ Resume fetched:", data); // ✅ Debug log
        console.log("🛠 Skills Data:", data.skills); // ✅ Log skills

        // Transform API data to match form structure
        setFormData({
          title: data.title || "",
          resume_status: data.resume_status || "",
          privacy_setting: data.privacy_setting || "",
          personalDetails: {
            firstName: data.personal_details?.first_name || "",
            lastName: data.personal_details?.last_name || "",
            email: data.personal_details?.email || "",
            phone: data.personal_details?.phone || "",
            website: data.personal_details?.website || "",
            github: data.personal_details?.github || "",
            linkedin: data.personal_details?.linkedin || "",
          },
          education: data.education.map((edu: any) => ({
            institution: edu.institution || "",
            major: edu.major === "custom" ? edu.customMajor : edu.major || "",
            startMonth: edu.start_date
              ? months[new Date(edu.start_date).getMonth()]
              : "",
            startYear: edu.start_date
              ? new Date(edu.start_date).getFullYear().toString()
              : "",
            endMonth: edu.end_date
              ? months[new Date(edu.end_date).getMonth()]
              : "",
            endYear: edu.end_date
              ? new Date(edu.end_date).getFullYear().toString()
              : "",
            cgpa: edu.cgpa,
          })),
          workExperience: data.work_experience.map((work: any) => ({
            employer: work.employer,
            role: work.role,
            startMonth: work.start_date
              ? months[new Date(work.start_date).getMonth()]
              : "",
            startYear: work.start_date
              ? new Date(work.start_date).getFullYear().toString()
              : "",
            endMonth: work.end_date
              ? months[new Date(work.end_date).getMonth()]
              : "",
            endYear: work.end_date
              ? new Date(work.end_date).getFullYear().toString()
              : "",
            description: work.description,
          })),
          skills: {
            technical: data.skills
              ?.filter((s: any) => s.skill_type === "TECHNICAL")
              .map((s: any) => s.skill_name)
              .join(", "),
            softSkills: data.skills
              ?.filter((s: any) => s.skill_type === "SOFT")
              .map((s: any) => s.skill_name)
              .join(", "),
            otherSkills: data.skills
              ?.filter((s: any) => s.skill_type === "OTHER")
              .map((s: any) => s.skill_name)
              .join(", "),
            languages: data.skills
              ?.filter((s: any) => s.skill_type === "LANGUAGE")
              .map((s: any) => s.skill_name)
              .join(", "),
          },
          awards: data.awards || [],
        });

        setResumeVisibility(data.privacy_setting || "PRIVATE");

        // Handle optional fields visibility
        setShowOptionalFields({
          website: !!data.personal_details?.website,
          github: !!data.personal_details?.github,
          linkedin: !!data.personal_details?.linkedin,
        });
      } catch (error) {
        console.error("Error fetching resume:", error);
        alert("Failed to load resume data");
      }
    };

    if (isEditing) fetchResumeData();
  }, [id, isEditing]);

  const toggleOptionalField = (field: keyof typeof showOptionalFields) => {
    setShowOptionalFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (
    section: string,
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const updatedSection = [...(prev as any)[section]];
      updatedSection[index][field] = value;
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleCustomSectionChange = (
    index: number,
    field: keyof Section,
    value: string
  ) => {
    const updatedSections = [...customSections];
    updatedSections[index][field] = value;
    setCustomSections(updatedSections);
  };

  const addCustomSection = () => {
    setCustomSections([...customSections, { title: "", content: "" }]);
  };

  const removeCustomSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalidCustomMajors = formData.education.some(
      (edu) => edu.major === "custom" && !edu.customMajor.trim()
    );

    if (hasInvalidCustomMajors) {
      alert("Please fill in custom major fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to perform this action.");
      navigate("/login");
      return;
    }

    const formattedResume = {
      title: formData.title || "Untitled Resume",
      resume_status: "DRAFT",
      privacy_setting: resumeVisibility,
      personal_details: {
        first_name: formData.personalDetails.firstName || "",
        last_name: formData.personalDetails.lastName || "",
        email: formData.personalDetails.email || "",
        phone: formData.personalDetails.phone || "",
        website: formData.personalDetails.website || null,
        github: formData.personalDetails.github || null,
        linkedin: formData.personalDetails.linkedin || null,
      },
      education: formData.education.map((edu) => ({
        institution: edu.institution || "",
        major: edu.major === "Other" ? edu.customMajor : edu.major || "",
        start_date:
          edu.startYear && edu.startMonth
            ? `${edu.startYear}-${String(
                months.indexOf(edu.startMonth) + 1
              ).padStart(2, "0")}-01`
            : null,
        end_date:
          edu.endYear && edu.endMonth
            ? `${edu.endYear}-${String(
                months.indexOf(edu.endMonth) + 1
              ).padStart(2, "0")}-01`
            : null,
        cgpa: edu.cgpa || null,
      })),
      work_experience: formData.workExperience.map((work) => ({
        employer: work.employer || "",
        role: work.role || "",
        start_date:
          work.startYear && work.startMonth
            ? `${work.startYear}-${String(
                months.indexOf(work.startMonth) + 1
              ).padStart(2, "0")}-01`
            : null,
        end_date: work.currentlyWorking
          ? null
          : work.endYear && work.endMonth
          ? `${work.endYear}-${String(
              months.indexOf(work.endMonth) + 1
            ).padStart(2, "0")}-01`
          : null,
        location:
          work.location === "custom"
            ? work.customLocation
            : work.location || "",
        description: work.description || "",
      })),
      skills: [
        ...formData.skills.technical
          .split(",")
          .map((s) => ({ skill_name: s.trim(), skill_type: "TECHNICAL", proficiency: "Beginner" })),
        ...formData.skills.softSkills
          .split(",")
          .map((s) => ({ skill_name: s.trim(), skill_type: "SOFT", proficiency: "Beginner" })),
        ...formData.skills.otherSkills
          .split(",")
          .map((s) => ({ skill_name: s.trim(), skill_type: "OTHER", proficiency: "Beginner" })),
        ...formData.skills.languages
          .split(",")
          .map((s) => ({ skill_name: s.trim(), skill_type: "LANGUAGE", proficiency: "Beginner" })),
      ].filter((skill) => skill.skill_name !== ""), // Remove empty skill values
      awards: formData.awards.map((award) => ({
        name: award.name || "",
        description: award.description || "",
        year: award.year || null,
      })),
    };

    console.log("🛠 Submitting Resume Data:", formattedResume); // ✅ Debug log before submission

    try {
      if (isEditing) {
        await api.put(`/resumes/${id}/`, formattedResume, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        alert("Resume updated successfully!");
      } else {
        await api.post("/resumes/", formattedResume, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        alert("Resume created successfully!");
      }
      navigate("/my-resumes");
    } catch (error: any) {
      console.error(
        "❌ Failed to create resume:",
        error.response?.data || error
      );
      alert("Error: " + JSON.stringify(error.response?.data, null, 2)); // ✅ Show API errors
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold text-primary mb-4">
        {isEditing ? "Edit Resume" : "Create a New Resume"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resume Title */}
        <label className="block">
          Resume Title:
          <input
            type="text"
            placeholder="Example: Software Engineer - Google"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <p className="text-gray-500 text-sm mt-1">
            Suggested Format: <b>Job Title - Company Name</b>
          </p>
        </label>

        <label className="block">
          Resume Visibility:
          <select
            value={resumeVisibility || "PRIVATE"} // ✅ Prevents undefined value
            onChange={(e) => setResumeVisibility(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>
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
              personalDetails: {
                ...formData.personalDetails,
                firstName: e.target.value,
              },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.personalDetails.lastName}
          onChange={(e) =>
            setFormData({
              ...formData,
              personalDetails: {
                ...formData.personalDetails,
                lastName: e.target.value,
              },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.personalDetails.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              personalDetails: {
                ...formData.personalDetails,
                email: e.target.value,
              },
            })
          }
          className="w-full px-4 py-2 border rounded-md"
          required
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
          required
        />

        {/* Optional Inputs for Website, GitHub, LinkedIn */}
        {showOptionalFields.website && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Website"
              className="w-full px-4 py-2 border rounded-md pr-12"
            />
            <button
              type="button"
              onClick={() => toggleOptionalField("website")}
              className="absolute right-0 top-0 h-full w-10 bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md"
            >
              ✖
            </button>
          </div>
        )}
        {showOptionalFields.github && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="GitHub"
              className="w-full px-4 py-2 border rounded-md pr-12"
            />
            <button
              type="button"
              onClick={() => toggleOptionalField("github")}
              className="absolute right-0 top-0 h-full w-10 bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md"
            >
              ✖
            </button>
          </div>
        )}
        {showOptionalFields.linkedin && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="LinkedIn"
              className="w-full px-4 py-2 border rounded-md pr-12"
            />
            <button
              type="button"
              onClick={() => toggleOptionalField("linkedin")}
              className="absolute right-0 top-0 h-full w-10 bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md"
            >
              ✖
            </button>
          </div>
        )}

        {/* Buttons Always Stay at the Bottom */}
        <div className="flex flex-wrap gap-3 mt-4">
          {!showOptionalFields.website && (
            <button
              type="button"
              onClick={() => toggleOptionalField("website")}
              className="text-blue-500 hover:underline"
            >
              Add Website
            </button>
          )}
          {!showOptionalFields.github && (
            <button
              type="button"
              onClick={() => toggleOptionalField("github")}
              className="text-blue-500 hover:underline"
            >
              Add GitHub
            </button>
          )}
          {!showOptionalFields.linkedin && (
            <button
              type="button"
              onClick={() => toggleOptionalField("linkedin")}
              className="text-blue-500 hover:underline"
            >
              Add LinkedIn
            </button>
          )}
        </div>

        {/* Education Section */}
        <h3 className="text-xl font-bold">Education</h3>
        {formData.education.map((edu, index) => (
          <div key={index} className="border p-4 rounded-md mb-4 relative">
            {/* Institution Name */}
            <input
              type="text"
              placeholder="Institution Name"
              value={edu.institution}
              onChange={(e) =>
                handleChange("education", index, "institution", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md"
              required
            />

            {/* Major (Predefined + Custom) */}
            <select
              value={edu.major}
              onChange={(e) =>
                handleChange("education", index, "major", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
            >
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
              <option value="custom">Other (Specify Below)</option>
            </select>
            {edu.major === "custom" && (
              <input
                type="text"
                placeholder="Custom Major"
                value={edu.customMajor}
                onChange={(e) =>
                  handleChange(
                    "education",
                    index,
                    "customMajor",
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 border rounded-md mt-2"
              />
            )}

            {/* Start & End Date (Month & Year Picker) */}
            <div className="flex gap-2 mt-2">
              <select
                value={edu.startMonth}
                onChange={(e) =>
                  handleChange("education", index, "startMonth", e.target.value)
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">Start Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={edu.startYear}
                onChange={(e) =>
                  handleChange("education", index, "startYear", e.target.value)
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">Start Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <select
                value={edu.endMonth}
                onChange={(e) =>
                  handleChange("education", index, "endMonth", e.target.value)
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">End Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={edu.endYear}
                onChange={(e) =>
                  handleChange("education", index, "endYear", e.target.value)
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">End Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* CGPA (Floating Number, 2 Decimals) */}
            <input
              type="number"
              placeholder="CGPA (Optional)"
              value={edu.cgpa}
              step="0.01"
              min="0"
              max="10"
              onChange={(e) =>
                handleChange("education", index, "cgpa", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
            />

            {/* Relevant Coursework (Optional Field) */}
            {edu.showCoursework && (
              <div className="relative w-full mt-2">
                <input
                  type="text"
                  placeholder="Relevant Coursework"
                  value={edu.coursework}
                  onChange={(e) =>
                    handleChange(
                      "education",
                      index,
                      "coursework",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border rounded-md pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleChange("education", index, "showCoursework", false)
                  }
                  className="absolute right-0 top-0 h-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md px-3"
                >
                  ✖
                </button>
              </div>
            )}

            {!edu.showCoursework && (
              <button
                type="button"
                onClick={() =>
                  handleChange("education", index, "showCoursework", true)
                }
                className="text-blue-500 hover:underline mt-2"
              >
                Add Coursework
              </button>
            )}

            {/* Remove Education Entry (If More Than One) */}
            {formData.education.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    education: prev.education.filter((_, i) => i !== index),
                  }));
                }}
                className="text-red-500 hover:underline mt-2 block"
              >
                Remove Education
              </button>
            )}
          </div>
        ))}

        {/* Add Another Education Button */}
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              education: [
                ...prev.education,
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
            }))
          }
          className="bg-primary text-white px-4 py-2 rounded-md mt-4"
        >
          Add Another Education
        </button>

        {/* Work Experience Section */}
        <h3 className="text-xl font-bold">Work Experience</h3>
        {formData.workExperience.map((work, index) => (
          <div key={index} className="border p-4 rounded-md mb-4">
            {/* Employer Name & Role */}
            <input
              type="text"
              placeholder="Employer Name"
              value={work.employer}
              onChange={(e) =>
                handleChange(
                  "workExperience",
                  index,
                  "employer",
                  e.target.value
                )
              }
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Role/Position"
              value={work.role}
              onChange={(e) =>
                handleChange("workExperience", index, "role", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
              required
            />

            {/* Start Date */}
            <div className="flex gap-2 mt-2">
              <select
                value={work.startMonth}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "startMonth",
                    e.target.value
                  )
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">Start Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={work.startYear}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "startYear",
                    e.target.value
                  )
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">Start Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* End Date / "Present" Option */}
            <div className="flex gap-2 mt-2">
              <select
                value={work.endMonth}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "endMonth",
                    e.target.value
                  )
                }
                className="w-1/2 px-4 py-2 border rounded-md"
                disabled={work.currentlyWorking} // Disable if "Present" is checked
              >
                <option value="">End Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={work.endYear}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "endYear",
                    e.target.value
                  )
                }
                className="w-1/2 px-4 py-2 border rounded-md"
                disabled={work.currentlyWorking} // Disable if "Present" is checked
              >
                <option value="">End Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox for "Currently Working Here" */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={work.currentlyWorking}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "currentlyWorking",
                    e.target.checked
                  )
                }
                className="mr-2"
              />
              <label>Currently Working Here</label>
            </div>

            {/* Location Selection (Dropdown + Custom Option) */}
            <select
              value={work.location}
              onChange={(e) =>
                handleChange(
                  "workExperience",
                  index,
                  "location",
                  e.target.value
                )
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
              <option value="custom">Other (Specify Below)</option>
            </select>
            {work.location === "custom" && (
              <input
                type="text"
                placeholder="Custom Location"
                value={work.customLocation}
                onChange={(e) =>
                  handleChange(
                    "workExperience",
                    index,
                    "customLocation",
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 border rounded-md mt-2"
              />
            )}

            {/* Description */}
            <textarea
              placeholder="Job Description"
              value={work.description}
              onChange={(e) =>
                handleChange(
                  "workExperience",
                  index,
                  "description",
                  e.target.value
                )
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
            />

            {/* "More Info" Input with Remove "X" Button */}
            {work.showMore && (
              <div className="relative w-full mt-2">
                <input
                  type="text"
                  placeholder="Additional Information"
                  value={work.moreInfo}
                  onChange={(e) =>
                    handleChange(
                      "workExperience",
                      index,
                      "moreInfo",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border rounded-md pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleChange("workExperience", index, "showMore", false)
                  }
                  className="absolute right-0 top-0 h-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md px-3"
                >
                  ✖
                </button>
              </div>
            )}

            {/* Toggle "More Info" Button */}
            {!work.showMore && (
              <button
                type="button"
                onClick={() =>
                  handleChange("workExperience", index, "showMore", true)
                }
                className="text-blue-500 hover:underline mt-2"
              >
                Add More Info
              </button>
            )}

            {/* Remove Job Entry (Only if More Than One) */}
            {formData.workExperience.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    workExperience: prev.workExperience.filter(
                      (_, i) => i !== index
                    ),
                  }));
                }}
                className="text-red-500 hover:underline mt-2 block"
              >
                Remove Job
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              workExperience: [
                ...prev.workExperience,
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
            }))
          }
          className="bg-primary text-white px-4 py-2 rounded-md mt-4"
        >
          Add Another Work Experience
        </button>

        {/* Skills Section */}
        <h3 className="text-xl font-bold mt-6">Skills</h3>
        <div className="border p-4 rounded-md mb-4">
          <input
            type="text"
            placeholder="Technical Skills (Comma Separated)"
            value={formData.skills.technical}
            onChange={(e) =>
              setFormData({
                ...formData,
                skills: { ...formData.skills, technical: e.target.value },
              })
            }
            className="w-full px-4 py-2 border rounded-md mb-2"
          />

          <input
            type="text"
            placeholder="Soft Skills (Comma Separated)"
            value={formData.skills.softSkills}
            onChange={(e) =>
              setFormData({
                ...formData,
                skills: { ...formData.skills, softSkills: e.target.value },
              })
            }
            className="w-full px-4 py-2 border rounded-md mb-2"
          />

          <input
            type="text"
            placeholder="Other Skills (Comma Separated)"
            value={formData.skills.otherSkills}
            onChange={(e) =>
              setFormData({
                ...formData,
                skills: { ...formData.skills, otherSkills: e.target.value },
              })
            }
            className="w-full px-4 py-2 border rounded-md mb-2"
          />

          <input
            type="text"
            placeholder="Languages (Comma Separated)"
            value={formData.skills.languages}
            onChange={(e) =>
              setFormData({
                ...formData,
                skills: { ...formData.skills, languages: e.target.value },
              })
            }
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Awards & Certificates Section (Optional) */}
        <h3 className="text-xl font-bold mt-6">Awards & Certificates</h3>
        {formData.awards.map((award, index) => (
          <div key={index} className="border p-4 rounded-md mb-4 relative">
            {/* Award Name */}
            <input
              type="text"
              placeholder="Award/Certificate Name"
              value={award.name}
              onChange={(e) =>
                handleChange("awards", index, "name", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md"
            />

            {/* Award Description */}
            <textarea
              placeholder="Description"
              value={award.description}
              onChange={(e) =>
                handleChange("awards", index, "description", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md mt-2"
            />

            {/* Year of Achievement (Maybe Include Month) */}
            <div className="flex gap-2 mt-2">
              <select
                value={award.year}
                onChange={(e) =>
                  handleChange("awards", index, "year", e.target.value)
                }
                className="w-1/2 px-4 py-2 border rounded-md"
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* "X" Button Inside Input Field for Removing Award */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  awards: prev.awards.filter((_, i) => i !== index),
                }))
              }
              className="absolute right-0 top-0 h-full bg-gray-200 hover:bg-gray-300 text-black flex items-center justify-center transition-colors rounded-r-md px-3"
            >
              ✖
            </button>
          </div>
        ))}

        {/* Button to Add Another Award */}
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              awards: [
                ...prev.awards,
                {
                  name: "",
                  description: "",
                  year: "",
                  showAward: false,
                },
              ],
            }))
          }
          className="bg-primary text-white px-4 py-2 rounded-md mt-4"
        >
          Add Another Award
        </button>

        {/* Custom Sections */}
        <h3 className="text-xl font-bold">Custom Sections</h3>
        {customSections.map((section, index) => (
          <div key={index} className="border p-4 rounded-md mb-4">
            <input
              type="text"
              placeholder="Section Title"
              value={section.title}
              onChange={(e) =>
                handleCustomSectionChange(index, "title", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md"
            />
            <textarea
              placeholder="Section Content"
              value={section.content}
              onChange={(e) =>
                handleCustomSectionChange(index, "content", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addCustomSection}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          Add Custom Section
        </button>
        {/* Submit Button */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-md"
          >
            {isEditing ? "Update Resume" : "Create Resume"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditResume;
