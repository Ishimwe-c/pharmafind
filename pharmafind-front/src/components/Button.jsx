// src/components/Button.jsx
import React from "react";

export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  variant = "primary",
}) {
  const baseStyles =
    "font-semibold py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const full = fullWidth ? "w-full" : "";

  const variants = {
    primary:
      "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 disabled:opacity-50",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:opacity-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${full} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
