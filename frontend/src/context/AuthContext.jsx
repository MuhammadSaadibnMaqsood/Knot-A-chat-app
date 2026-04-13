import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 important for refresh
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ✅ fetch user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      setUser(data.user);
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/signup", {
        username,
        email,
        password,
      });
      setUser(data.user);
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message || "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      setUser(null);
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, loading, checkingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);