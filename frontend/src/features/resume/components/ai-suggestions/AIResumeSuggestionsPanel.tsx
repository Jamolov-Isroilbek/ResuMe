// src/features/resume/components/ai-suggestions/AIResumeSuggestionsPanel.tsx
import React, { useState } from "react";
import { Button } from "@/lib/ui/buttons/Button";
import { AISuggestions } from "./AISuggestions";
import { ResumeFormData } from "@/types/shared/resume";

interface AIResumeSuggestionsPanelProps {
  resumeData: ResumeFormData;
}

const isResumeComplete = (resume: ResumeFormData): boolean => {
  // For simplicity, check that the following mandatory fields are filled:
  // title, personal_details (first & last name), at least one education entry,
  // one work_experience entry, and at least one skill.
  if (!resume.title.trim()) return false;
  if (
    !resume.personal_details ||
    !resume.personal_details.first_name ||
    !resume.personal_details.last_name
  )
    return false;
  if (!resume.education || resume.education.length === 0) return false;
  if (!resume.work_experience || resume.work_experience.length === 0)
    return false;
  if (!resume.skills || resume.skills.length === 0) return false;
  return true;
};

export const AIResumeSuggestionsPanel: React.FC<AIResumeSuggestionsPanelProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const complete = isResumeComplete(resumeData);

  const handleGetSuggestions = () => {
    setShowSuggestions(true);
    setSuggestionKey(prev => prev + 1);
  };

  return (
    <div className={`ai-panel-container ${isOpen ? 'open' : ''}`}>
      <div 
        className="ai-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '◀' : '▶'}
      </div>
      
      <div className="ai-panel-content">
        <h2 className="text-xl font-bold mb-4">AI Resume Suggestions</h2>
        {!complete && (
          <p className="text-red-500">
            Complete required fields to enable AI suggestions
          </p>
        )}
        
        {complete && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border rounded-md p-2"
                rows={4}
              />
            </div>
            
            <Button variant="primary" onClick={handleGetSuggestions}>
              Generate Suggestions
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