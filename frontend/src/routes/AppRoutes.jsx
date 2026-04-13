import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import ChatPage from "../pages/ChatPage";
import useAuth from "../hooks/auth";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <AuthPage />}
      />
      <Route
        path="/chat"
        element={user ? <ChatPage /> : <Navigate to="/" />}
      />
    </Routes>
  );
}