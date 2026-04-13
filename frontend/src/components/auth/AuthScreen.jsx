import { useState } from "react";

const AuthScreen = ({ onLogin, onSignup, loading }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handle = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      await onLogin(form.email, form.password);
    } else {
      await onSignup(form.name, form.email, form.password);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={styles.authWrap}>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>
          <MessageSquare size={28} color="#60a5fa" />
          <span style={styles.authLogoText}>Convo</span>
        </div>
        <h2 style={styles.authTitle}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <form onSubmit={handle} style={styles.form}>
          {mode === "signup" && (
            <input
              style={styles.input}
              placeholder="Full name"
              value={form.name}
              onChange={set("name")}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set("password")}
            required
          />
          <button style={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Sign up"
            )}
          </button>
        </form>
        <p style={styles.authSwitch}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span
            style={styles.authLink}
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;