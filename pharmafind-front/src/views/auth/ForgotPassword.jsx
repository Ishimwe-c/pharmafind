import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      // Navigate to success page or show success message
      navigate("/auth/reset-link-sent");
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <span className="material-icons text-teal-500 text-5xl mb-4">
          check_circle
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Link Sent!
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to {email}
        </p>
        <Link
          to="/auth/login"
          className="text-teal-500 hover:text-teal-600 font-medium"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <span className="material-icons text-teal-500 text-5xl mb-4">
          lock_reset
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-600">
          Enter the email address associated with your account and we will
          send an email with instructions to reset your password.
        </p>
      </div>

      {/* Show error if request fails */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
          autoComplete="email"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center mt-6">
        <Link
          to="/auth/login"
          className="text-sm text-teal-500 hover:text-teal-600 flex items-center justify-center"
        >
          <span className="material-icons mr-1 text-sm">arrow_back</span>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
