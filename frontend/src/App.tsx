import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "@/app/layouts/main-layout/Navbar";
import Home from "@/app/pages/Home";
import Dashboard from "@/app/pages/dashboard/Dashboard";
import PublicResumes from "@/app/pages/resume/PublicResumes";
import Profile from "@/app/pages/profile/Profile";
import MyResumes from "@/app/pages/resume/MyResumes";
import Login from "@/app/pages/auth/Login";
import Register from "@/app/pages/auth/Register";
import CreateEditResume from "@/app/pages/resume/CreateEditResume";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ThemeProvider } from "@/context/ThemeContext"; // ✅ make sure path matches your setup

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* <ThemeProvider> */}
          <Router>
            {/* 🌙 App-wide Dark Mode Styling */}
            <div className="min-h-screen bg-white text-gray-800 dark:bg-zinc-900 dark:text-gray-100 transition-colors duration-300">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/public-resumes" element={<PublicResumes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-resumes" element={<MyResumes />} />
                <Route path="/create-resume" element={<CreateEditResume />} />
                <Route path="/resumes/:id/edit" element={<CreateEditResume />} />
              </Routes>
            </div>
          </Router>
        {/* </ThemeProvider> */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
