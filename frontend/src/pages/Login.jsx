import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-lime-500/10 blur-2xl" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wide text-white flex justify-center items-center gap-1">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              G
            </span>
            <span className="text-white font-light">
              olf Charity
            </span>
            <span className="text-yellow-400 text-xl">⛳</span>
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Premium golf charity platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-5 relative">
          <input
            type="email"
            className={`w-full px-4 py-3 bg-white/10 border ${
              focusedEmail ? "border-green-400" : "border-white/20"
            } rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500/50 transition`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedEmail(true)}
            onBlur={() => setFocusedEmail(false)}
          />
          <label className="absolute left-4 -top-2 text-xs bg-black/70 px-2 rounded text-gray-400">
            Email
          </label>
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <input
            type="password"
            className={`w-full px-4 py-3 bg-white/10 border ${
              focusedPassword ? "border-green-400" : "border-white/20"
            } rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500/50 transition`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedPassword(true)}
            onBlur={() => setFocusedPassword(false)}
          />
          <label className="absolute left-4 -top-2 text-xs bg-black/70 px-2 rounded text-gray-400">
            Password
          </label>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-gray-400 text-sm text-center mt-5">
          Don’t have an account?
          <span className="text-green-400 ml-1 cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;