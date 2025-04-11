// src/pages/auth/GuestLogin.tsx

import React, { useState } from "react";
import axiosClient from "@/lib/api/axiosClient";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const GuestLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { guestLogin } = useAuth();
  const navigate = useNavigate();
  const [guestToken, setGuestToken] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // Call your new backend endpoint for guest login
      const response = await axiosClient.post('/api/auth/guest/');
      guestLogin(response.data.guest_token);
      // Save the guest token (you may also want to store guest_id and expiration data)
    //   setGuestToken(response.data.guest_token);
      // Optionally, pass the token to your AuthProvider or store it in a secure cookie
      navigate("/dashboard");
    } catch (error) {
      console.error("Guest login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGuestLogin} disabled={loading}>
        Login as Guest
      </button>
      {guestToken && (
        <p>Logged in as guest. Your token: {guestToken}</p>
      )}
    </div>
  );
};

export default GuestLogin;
