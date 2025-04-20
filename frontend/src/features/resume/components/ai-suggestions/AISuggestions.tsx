// src/features/resume/components/ai-suggestions/AISuggestions.tsx
import React, { useEffect, useState } from "react";
import axios from "@/lib/api/axiosClient";
import { ResumeFormData } from "@/types/shared/resume";

interface SuggestionItem {
  section: string;
  entry_name: string;
  original: string;
  issues: string[];
  suggestion: string;
  match?: string;
}

interface AISuggestionsProps {
  resumeData: ResumeFormData;
  jobDescription?: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  resumeData,
  jobDescription,
}) => {
  const [data, setData] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which sections and entries are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openEntries, setOpenEntries] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log("📤 Sending resume data for suggestions:", resumeData);
        const res = await axios.post("/nlp/ai-suggestions/", {
          resume: resumeData,
          job_description: jobDescription || "",
        });
        console.log("📥 Received AI suggestions:", res.data);
        setData(res.data.suggestions || []);

        // Initialize all sections as open by default
        const sections: Record<string, boolean> = {};
        res.data.suggestions.forEach((item: SuggestionItem) => {
          sections[item.section] = true;
        });
        setOpenSections(sections);
      } catch (e) {
        console.error("❌ Error fetching AI suggestions:", e);
        setError("Failed to fetch AI suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [resumeData, jobDescription]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleEntry = (entryId: string) => {
    setOpenEntries((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  const formatEntryTitle = (item: SuggestionItem) => (
    <div className="ai-entry-name">{item.entry_name}</div>
  );

  const MAX_ORIGINAL_LEN = 100;

  if (loading)
    return (
      <p className="mt-6 text-center text-blue-500">
        ⏳ Generating AI suggestions...
      </p>
    );
  if (error) return <p className="mt-6 text-center text-red-500">{error}</p>;
  if (data.length === 0)
    return <p className="mt-6 text-center">No suggestions available.</p>;

  // Group by section
  const bySection: Record<string, SuggestionItem[]> = {};
  data.forEach((item) => {
    bySection[item.section] = bySection[item.section] || [];
    bySection[item.section].push(item);
  });

  return (
    <div className="mt-6">
      {Object.entries(bySection).map(([section, items]) => (
        <div key={section} className="ai-section-card">
          {/* Section Header */}
          <div
            className={`ai-section-header ${
              openSections[section] ? "open" : ""
            }`}
            onClick={() => toggleSection(section)}
          >
            {section
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>

          {/* Section Content */}
          {openSections[section] && (
            <div className="ai-section-content">
              {items.map((item, idx) => {
                const entryId = `${section}-${item.entry_name}-${idx}`;
                return (
                  <div key={entryId} className="ai-entry">
                    <div
                      className="ai-entry-header justify-between"
                      onClick={() => toggleEntry(entryId)}
                    >
                      {formatEntryTitle(item)}
                      <div className="flex items-center gap-2">
                         {item.match && (
      <span className="mr-2 text-xs font-semibold px-2 py-0.5 rounded
                       bg-blue-600/20 text-blue-700 dark:text-blue-300">
        {item.match}
      </span>
    )}
                        <span
                          className={`ai-entry-toggle ${
                            openEntries[entryId] ? "open" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>

                    </div>

                    {/* Entry Content */}
                    {openEntries[entryId] && (
                      <div className="ai-entry-content">
                        {/* Original Text */}
                        <div className="ai-entry-section">
                          {item.issues.length === 0 && !item.suggestion && (
                            <div className="ai-approved">
                              ✓ Looks great as is
                            </div>
                          )}
                          <div className="ai-entry-section-label">
                            Original:
                          </div>
                          <div className="ai-original-text">
                            {item.original.length > MAX_ORIGINAL_LEN
                              ? `${item.original.slice(0, MAX_ORIGINAL_LEN)}…`
                              : item.original}
                          </div>
                        </div>

                        {/* Feedback/Issues */}
                        {item.issues && item.issues.length > 0 && (
                          <div className="ai-entry-section">
                            <div className="ai-entry-section-label">
                              Feedback:
                            </div>
                            <ul className="ai-feedback-list">
                              {item.issues.map((issue, i) => (
                                <li key={i} className="ai-feedback-item">
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestion */}
                        {item.suggestion && (
                          <div className="ai-entry-section">
                            <div className="ai-entry-section-label">
                              Suggestion:
                            </div>
                            <div className="ai-suggestion">
                              {item.suggestion}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
