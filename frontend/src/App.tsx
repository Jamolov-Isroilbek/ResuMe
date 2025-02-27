import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyResumes from "./pages/MyResumes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEditResume from "./pages/CreateEditResume";
import { AuthProvider } from "./context/AuthContext";

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-resumes" element={<MyResumes />} />
          <Route path="/create-resume" element={<CreateEditResume />} />
          <Route path="/edit-resume/:id" element={<CreateEditResume />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
