// src/hooks/resume/useSectionHandlers.ts
import { useState } from "react";

export const useSectionHandlers = <T extends object>(initialItem: T) => {
  const [sections, setSections] = useState<T[]>([]);

  const addSection = () => setSections([...sections, initialItem]);
  
  const removeSection = (index: number) =>
    setSections(sections.filter((_, i) => i !== index));

  const updateSection = (index: number, field: keyof T, value: any) =>
    setSections(sections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    ));

  return { sections, addSection, removeSection, updateSection };
};