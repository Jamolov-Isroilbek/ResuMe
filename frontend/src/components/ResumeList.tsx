import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button, Typography, List, ListItem, ListItemText} from '@mui/material';

type Resume = {
    id: number;
    title: string;
    resume_status: string;
    privacy_setting: string;
};

const ResumeList: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await api.get('/resumes/');
                setResumes(response.data);
            } catch (error) {
                console.error('Failed to fetch resume: ', error);
            }
        };
        fetchResumes();
    }, []);

    const handleDownload = async (id: number) => {
        try {
            const response = await api.get(`/resumes/${id}/download/`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Resume_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download resume:', error);
        }
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                My Resumes
            </Typography>
            <List>
                {resumes.map((resume) => (
                    <ListItem key={resume.id}>
                        <ListItemText primary={resume.title} secondary={`Status: ${resume.resume_status} | Privacy: ${resume.privacy_setting}`} />
                        <Button
                            variant="contained"
                            color='primary'
                            onClick={() => handleDownload(resume.id)}
                        >
                            Download PDF
                        </Button>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default ResumeList;