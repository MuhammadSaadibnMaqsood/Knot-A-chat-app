import { Mail, MessageSquare, User, Lock, Loader2, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const AuthScreen = ({ onLogin, onSignup, loading }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const navigate = useNavigate();
  const formRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the left visual side
      gsap.from(visualRef.current, {
        xPercent: -100,
        duration: 1.2,
        ease: "power4.out",
      });

      // Animate form elements staggered
      gsap.from(".animate-item", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.5,
      });
    });
    return () => ctx.revert();
  }, []);

  // Animate when switching between Login and Signup
  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: mode === "login" ? -20 : 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
    );
  }, [mode]);

  const handle = async (e) => {
    e.preventDefault();
    let success = false;
    if (mode === "login") {
      success = await onLogin(form.email, form.password);
    } else {
      success = await onSignup(form.name, form.email, form.password);
    }
    if (success) navigate("/chat");
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen w-full flex bg-[#fafafa] overflow-hidden font-sans">
      {/* LEFT SIDE: Visual/Video Section (Hidden on Mobile) */}
      <div
        ref={visualRef}
        className="hidden lg:flex lg:w-1/2 relative bg-blue-600 items-center justify-center overflow-hidden"
      >
        {/* Background Video or Animated Gradient */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 scale-110"
          >
            {/* You can replace this URL with a local abstract MP4 */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-abstract-flow-of-blue-and-purple-light-31477-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-blue-900/40" />
        </div>

        {/* Branding on Video */}
        <div className="z-10 text-center px-12">
          <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-6 animate-bounce duration-[3s]">
            <MessageSquare size={60} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter mb-4">
            Knot.
          </h1>
          <p className="text-blue-100 text-xl font-light max-w-md mx-auto leading-relaxed">
            The nexus of human connection. Modern messaging, re-imagined for the
            next generation.
          </p>
        </div>

        {/* Floating Decorative Stats */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between text-white/60 text-xs font-bold tracking-[0.2em] uppercase">
          <span>Encrypted End-to-End</span>
          <span>v2.0.4 Global</span>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div ref={formRef} className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="p-3 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-200">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Knot</h1>
          </div>

          <div ref={contentRef}>
            <div className="animate-item">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {mode === "login" ? "Welcome back" : "Join the circle"}
              </h2>
              <p className="text-slate-500 mb-10 font-medium">
                {mode === "login"
                  ? "Enter your credentials to access your secure chats."
                  : "Start your journey with the world's fastest messenger."}
              </p>
            </div>

            <form onSubmit={handle} className="space-y-5">
              {mode === "signup" && (
                <div className="animate-item relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    size={20}
                  />
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Full name"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
              )}

              <div className="animate-item relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>

              <div className="animate-item relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={set("password")}
                  required
                />
              </div>

              {mode === "login" && (
                <div className="animate-item flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="animate-item w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">
                      {mode === "login" ? "Sign in" : "Create Account"}
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="animate-item mt-10">
              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="flex gap-4 mt-2">
                <button className="flex-1 flex items-center cursor-pointer justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700">
                  <Globe size={18} /> Google
                </button>
              </div>
            </div>

            <div className="animate-item mt-10 text-center">
              <p className="text-slate-500 font-medium">
                {mode === "login" ? "New to Knot?" : "Already a member?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-blue-600 cursor-pointer font-black hover:underline underline-offset-4 ml-1"
                >
                  {mode === "login" ? "Create an account" : "Log in here"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
