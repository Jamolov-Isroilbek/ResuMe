// src/features/resume/components/ai-suggestions/AISuggestions.tsx
import React, { useState } from "react";
import { Button } from "@/lib/ui/buttons/Button";
import { Loader } from "@/lib/ui/common/Loader";
import axiosClient from "@/lib/api/axiosClient";

interface AISuggestionsResult {
  summary_feedback?: string;
  summary_modified?: string;
  work_experience_feedback?: string;
  work_experience_modified?: string;
  education_feedback?: string;
  education_modified?: string;
  skills_feedback?: string;
  skills_modified?: string;
  awards_feedback?: string;
  awards_modified?: string;
}

interface AISuggestionsProps {
  resumeData: any; // You can replace 'any' with your specific ResumeFormData type
  jobDescription: string;
  className?: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  resumeData,
  jobDescription,
}) => {
  const resetSuggestions = () => {
    setSuggestions(null);
    setError("");
  };
  const [suggestions, setSuggestions] = useState<AISuggestionsResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  React.useEffect(() => {
    fetchSuggestions();
  }, []);


  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");
    setSuggestions(null);
    try {
      // Send the full resume data along with the optional job description
      const response = await axiosClient.post("/nlp/ai-suggestions/", {
        ...resumeData,
        job_description: jobDescription || undefined,
      });
      setSuggestions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="mt-4 border p-4 rounded-lg bg-gray-50">
      {loading && <Loader />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && suggestions && (
        <div className="space-y-6">
          {suggestions.summary_feedback && (
            <div>
              <h3 className="font-bold text-lg">Summary Feedback</h3>
              <p>{suggestions.summary_feedback}</p>
              {suggestions.summary_modified && (
                <>
                  <h4 className="font-semibold">Modified Summary</h4>
                  <p>{suggestions.summary_modified}</p>
                </>
              )}
            </div>
          )}
          {suggestions.work_experience_feedback && (
            <div>
              <h3 className="font-bold text-lg">Work Experience Feedback</h3>
              <p>{suggestions.work_experience_feedback}</p>
              {suggestions.work_experience_modified && (
                <>
                  <h4 className="font-semibold">Modified Work Experience</h4>
                  <p>{suggestions.work_experience_modified}</p>
                </>
              )}
            </div>
          )}
          {suggestions.education_feedback && (
            <div>
              <h3 className="font-bold text-lg">Education Feedback</h3>
              <p>{suggestions.education_feedback}</p>
              {suggestions.education_modified && (
                <>
                  <h4 className="font-semibold">Modified Education</h4>
                  <p>{suggestions.education_modified}</p>
                </>
              )}
            </div>
          )}
          {suggestions.skills_feedback && (
            <div>
              <h3 className="font-bold text-lg">Skills Feedback</h3>
              <p>{suggestions.skills_feedback}</p>
              {suggestions.skills_modified && (
                <>
                  <h4 className="font-semibold">Modified Skills</h4>
                  <p>{suggestions.skills_modified}</p>
                </>
              )}
            </div>
          )}
          {suggestions.awards_feedback && (
            <div>
              <h3 className="font-bold text-lg">Awards Feedback</h3>
              <p>{suggestions.awards_feedback}</p>
              {suggestions.awards_modified && (
                <>
                  <div>
                    <h4 className="font-semibold">Modified Awards</h4>
                    <p>{suggestions.awards_modified}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <>
        {!loading && !error && !suggestions && (
          <Button variant="primary" onClick={fetchSuggestions}>
            Get AI Suggestions
          </Button>
        )}
        {suggestions && (
          <Button
            variant="secondary"
            onClick={resetSuggestions}
            className="mt-4"
          >
            New Suggestions
          </Button>
        )}
      </>
    </div>
  );
};
