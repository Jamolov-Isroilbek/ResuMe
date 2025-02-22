import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LogoutButton from "./components/LogoutButton";
import EditResume from "./components/EditResume";  // Import the component
import { useAuth, AuthProvider } from "./context/AuthContext";

const NavigationBar = () => {
  const { isLoggedIn } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link> |{" "}
      {isLoggedIn ? (
        <LogoutButton />
      ) : (
        <>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit-resume/:id" element={<EditResume />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
