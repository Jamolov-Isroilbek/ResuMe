import React from 'react';
import { Button } from '@/components/ui/Button';

interface ResumeCardProps {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const ResumeCard = ({ title, onEdit, onDelete }: ResumeCardProps) => (
  <div className="p-4 bg-white shadow-md rounded-lg mb-4 hover:bg-gray-50 transition">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="flex gap-2">
      <Button variant="secondary" onClick={onEdit} className="flex-1">
        Edit
      </Button>
      <Button variant="danger" onClick={onDelete} className="flex-1">
        Delete
      </Button>
    </div>
  </div>
);