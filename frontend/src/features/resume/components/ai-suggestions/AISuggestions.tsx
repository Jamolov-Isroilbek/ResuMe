// src/features/resume/components/ai-suggestions/AISuggestions.tsx
import React, { useEffect, useState } from "react";
import axios from "@/lib/api/axiosClient";
import { ResumeFormData } from "@/types/shared/resume";

interface SuggestionItem {
  section: string;
  original: any;
  ai_feedback: string;
}

interface AISuggestionsProps {
  resumeData: ResumeFormData;
  jobDescription?: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ resumeData, jobDescription }) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | Record<string, any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.post("/nlp/ai-suggestions/", {
          resume: resumeData,
          job_description: jobDescription || "",
        });

        setSuggestions(response.data);
      } catch (err: any) {
        console.error("❌ Failed to fetch suggestions", err);
        setError("Failed to fetch AI suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [resumeData, jobDescription]);

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <p className="text-blue-500">⏳ Generating suggestions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4 mt-4">
      {Array.isArray(suggestions) ? (
        suggestions.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border-l-4 border-blue-500 p-4 rounded shadow-sm"
          >
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleExpand(idx)}
            >
              <h3 className="font-semibold text-blue-600 capitalize">
                {item.section.replace(/_/g, " ")}
              </h3>
              <span className="text-gray-400 text-sm">
                {expandedIndices[idx] ? "⬆" : "⬇"}
              </span>
            </div>

            {expandedIndices[idx] && (
              <div className="text-sm text-gray-800 space-y-2">
                {item.original && (
                  <div>
                    <strong className="text-gray-700">📝 Original:</strong>
                    <pre className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                      {JSON.stringify(item.original, null, 2)}
                    </pre>
                  </div>
                )}

                {item.ai_feedback && (
                  <div>
                    <strong className="text-gray-700">💡 Feedback & Suggestion:</strong>
                    <div className="bg-blue-50 p-2 rounded whitespace-pre-wrap">
                      {item.ai_feedback.replace(/\n/g, "\n• ")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        Object.entries(suggestions).map(([key, value], index) => (
          <div
            key={index}
            className="bg-white p-4 shadow rounded border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleExpand(index)}>
              <h3 className="text-lg font-bold capitalize">
                {key.replace(/_/g, " ")}
              </h3>
              <span className="text-gray-400 text-sm">
                {expandedIndices[index] ? "⬆" : "⬇"}
              </span>
            </div>
            {expandedIndices[index] && (
              <p className="text-gray-700 whitespace-pre-line">
                {typeof value === "string"
                  ? value
                  : JSON.stringify(value, null, 2)}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};
