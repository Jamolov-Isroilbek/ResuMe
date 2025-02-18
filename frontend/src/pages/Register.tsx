import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleRegister = async (formData: { username: string; email: string; password: string }) => {
    try {
      console.log('📤 Sending registration request...', formData);
      const response = await api.post('/auth/register/', formData);
      if (response.status === 201) {
        setMessage('✅ Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '❌ Registration failed!';
      setMessage(errorMsg);
      console.error('⚠️ Failed to register:', errorMsg);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
};

export default Register;
