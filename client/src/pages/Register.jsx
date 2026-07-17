import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
      <div className="card w-full max-w-sm p-8">
        <p className="label-eyebrow mb-2">Create account</p>
        <h1 className="mb-6 font-display text-2xl font-semibold text-slate-100">
          Start analyzing repos
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-slate-400">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-signal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
