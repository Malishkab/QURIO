
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      if (!email.endsWith("@thapar.edu")) {
        return setMessage("Only @thapar.edu emails are allowed.");
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCred.user);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleSignup = async () => {
    try {
      if (!email.endsWith("@thapar.edu")) {
        return setMessage("Only @thapar.edu emails are allowed.");
      }

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created! You can log in now.");
      setIsSignup(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email.endsWith("@thapar.edu")) {
        return setMessage("Enter your thapar.edu email first.");
      }
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="bg-white shadow-xl p-10 rounded-xl w-96">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        <input
          type="email"
          placeholder="Thapar Email"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="text-red-500 text-sm mb-3">{message}</p>}

        <button
          onClick={isSignup ? handleSignup : handleLogin}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold mb-4"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        {!isSignup && (
          <p
            className="text-indigo-600 text-sm text-center cursor-pointer mb-3"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </p>
        )}

        <p className="text-center text-sm">
          {isSignup ? "Already have an account?" : "New user?"}{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
