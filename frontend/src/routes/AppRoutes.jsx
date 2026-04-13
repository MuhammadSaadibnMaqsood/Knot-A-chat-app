import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import ChatPage from "../pages/ChatPage";
import { useAuth } from "../context/AuthContext";

export default function AppRoutes() {
  const { user, checkingAuth } = useAuth();

  // 🔥 prevent redirect before auth check
  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/chat" /> : <AuthPage />} />
      <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/" />} />
    </Routes>
  );
}