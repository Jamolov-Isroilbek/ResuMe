// src/features/resume/components/templates/TemplateSelector.tsx
import React from "react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onChange: (template: string) => void;
}

const templates = [
  { id: "template_classic", name: "Classic" },
  { id: "template_deedy", name: "Deedy Reversed" },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onChange,
}) => {
  return (
    <div className="mb-4">
  <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Choose a Template
  </label>
  <select
    id="template-select"
    value={selectedTemplate}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    >
    {templates.map((template) => (
      <option key={template.id} value={template.id}>
        {template.name}
      </option>
    ))}
  </select>
</div>

  );
};
