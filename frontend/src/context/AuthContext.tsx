import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AuthContextType = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('access_token'));

    // Check localStorage for tokens on initial load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    });

    // Login and logout functions
    const login = () => setIsLoggedIn(true);
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
