import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyResumes from "./pages/MyResumes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateResume from "./pages/CreateResume";
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-resumes" element={<MyResumes />} />
          <Route path="/create-resume" element={<CreateResume />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
