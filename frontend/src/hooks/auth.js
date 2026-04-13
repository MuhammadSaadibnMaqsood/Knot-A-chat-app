import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });

      setUser(data?.user);
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
      console.log(username);
      const { data } = await API.post("/auth/signup", {
        username,
        email,
        password,
      });
      setUser(data?.user);
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
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  return { user, loading, login, signup, logout };
};

export default useAuth;
