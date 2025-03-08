import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PublicResumes from "./pages/PublicResumes";
import Profile from "./pages/Profile";
import MyResumes from "./pages/MyResumes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEditResume from "./pages/CreateEditResume";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "react-error-boundary";

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
          <Route
            path="/my-resumes"
            element={
              <ErrorBoundary fallback={<div>Error loading resumes</div>}>
                <MyResumes />
              </ErrorBoundary>
            }
          />
          <Route path="/create-resume" element={<CreateEditResume />} />
          <Route path="/resumes/:id/edit" element={<CreateEditResume />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
