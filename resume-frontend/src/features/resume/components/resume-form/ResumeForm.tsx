// src/components/resume/ResumeForm.tsx
import React from "react";
import { FormSection } from "@/features/resume/components/form/FormSection";

interface ResumeFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ children, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-8">
    <FormSection title="Resume Metadata">
      {children}
    </FormSection>
    
    {/* Add other sections as needed */}
  </form>
);