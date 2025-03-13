import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "@/app/layouts/MainLayout/Navbar";
import Home from "@/app/pages/Home";
import Dashboard from "@/app/pages/dashboard/Dashboard";
import PublicResumes from "@/app/pages/resume/PublicResumes";
import Profile from "@/app/pages/profile/Profile";
import MyResumes from "@/app/pages/resume/MyResumes";
import Login from "@/app/pages/auth/Login";
import Register from "@/app/pages/auth/Register";
import CreateEditResume from "@/app/pages/resume/CreateEditResume";
import { AuthProvider } from "@/providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
