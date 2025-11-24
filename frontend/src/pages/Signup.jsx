import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const domainAllowed = (mail) => mail.toLowerCase().endsWith("@thapar.edu");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!domainAllowed(email)) {
      setError("Only @thapar.edu emails are allowed to sign up.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, displayName);
      // Optional: inform user to check email for verification
      alert("Account created. Please check your email for verification link.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Create account</h2>

        {error && <div className="text-red-500 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full name (optional)"
            className="w-full p-3 border rounded"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourid@thapar.edu"
            type="email"
            required
            className="w-full p-3 border rounded"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="w-full p-3 border rounded"
          />
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            type="password"
            required
            className="w-full p-3 border rounded"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Create account
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <button className="text-indigo-600 underline" onClick={() => navigate("/login")}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
