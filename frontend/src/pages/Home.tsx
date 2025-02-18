import React from 'react';
import ResumeList from '../components/ResumeList';
import { Container, Typography } from '@mui/material';

const Home: React.FC = () => {
    return (
        <Container>
            <Typography variant="h3" gutterBottom>
                Welcome to ResuMe Builder
            </Typography>
            <ResumeList />
        </Container>
    );
};

export default Home;
