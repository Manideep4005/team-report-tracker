import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();

    if (loading) return;

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch {
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 py-6 sm:px-6 lg:px-8">

      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-2xl sm:p-8 lg:p-10">

        {/* Logo */}

        <div className="mb-8 text-center">


          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to Team Work
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* Email */}

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
            />

          </div>

          {/* Password */}

          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 pr-12 text-base text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white"
              >
                {showPassword ? (
                  <HiOutlineEyeSlash size={20} />
                ) : (
                  <HiOutlineEye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* Login */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}