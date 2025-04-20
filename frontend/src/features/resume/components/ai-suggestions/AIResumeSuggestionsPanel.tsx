// src/features/resume/components/ai-suggestions/AIResumeSuggestionsPanel.tsx
import React, { useState } from "react";
import { Button } from "@/lib/ui/buttons/Button";
import { AISuggestions } from "./AISuggestions";
import { ResumeFormData } from "@/types/shared/resume";
import { TooltipIcon } from "@/lib/ui/common/TooltipIcon";

interface AIResumeSuggestionsPanelProps {
  resumeData: ResumeFormData;
}

const isResumeComplete = (resume: ResumeFormData): boolean => {
  // For simplicity, check that the following mandatory fields are filled:
  // title, personal_details (first & last name), at least one education entry,
  // one work_experience entry, and at least one skill.
  if (!resume.title?.trim()) return false;
  if (
    !resume.personal_details ||
    !resume.personal_details.first_name?.trim() ||
    !resume.personal_details.last_name?.trim()
  )
    return false;
  if (!resume.education || resume.education.length === 0) return false;
  if (!resume.work_experience || resume.work_experience.length === 0)
    return false;
  if (!resume.skills || resume.skills.length === 0) return false;
  return true;
};

export const AIResumeSuggestionsPanel: React.FC<
  AIResumeSuggestionsPanelProps
> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const complete = isResumeComplete(resumeData);

  const handleGetSuggestions = () => {
    setShowSuggestions(true);
    setSuggestionKey((prev) => prev + 1);
  };

  return (
    <div className={`ai-panel-container ${isOpen ? "open" : ""}`}>
      <div className="ai-panel-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? "◀" : "▶"}</span>
      </div>

      <div className="ai-panel-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Resume Suggestions</h2>
          <TooltipIcon
            content={
              "• Resume only → the AI polishes each section.\n" +
              "• Resume + job description → the AI tailors suggestions AND shows a match rating " +
              "(Poor ▸ Fair ▸ Good ▸ Excellent) beside each entry."
            }
          />{" "}
        </div>

        {!complete && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>
              Please complete all required resume fields to enable AI
              suggestions.
            </p>
          </div>
        )}

        {complete && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border rounded-md p-3 resize-y min-h-[100px]"
                placeholder="Paste job description here to get tailored suggestions..."
              />
            </div>

            <Button
              variant="primary"
              onClick={handleGetSuggestions}
              className="w-full py-2"
            >
              {showSuggestions
                ? "Regenerate Suggestions"
                : "Generate Suggestions"}
            </Button>
          </>
        )}

        {showSuggestions && complete && (
          <AISuggestions
            key={suggestionKey}
            resumeData={resumeData}
            jobDescription={jobDescription}
          />
        )}
      </div>
    </div>
  );
};
