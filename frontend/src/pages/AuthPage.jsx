import AuthScreen from "../components/auth/AuthScreen";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, signup, loading } = useAuth();

  return (
    <AuthScreen onLogin={login} onSignup={signup} loading={loading} />
  );
}
