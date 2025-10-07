// src/views/auth/Register.jsx
import { useState } from "react";
import RegisterPatient from "./RegisterPatient";
import RegisterPharmacy from "./RegisterPharmacy";

export default function Register() {
  // Keep track of which tab is active
  const [activeTab, setActiveTab] = useState("patient");

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a className="text-2xl font-bold text-gray-800" href="/">
            PharmaFind
          </a>
          <div className="flex items-center space-x-6">
            <a className="text-gray-600 hover:text-gray-800" href="/about">
              About
            </a>
            <a className="text-gray-600 hover:text-gray-800" href="/contact">
              Contact
            </a>
            <a
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
              href="/auth/login"
            >
              Login
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Register
          </h1>

          {/* Tabs */}
          <div className="flex justify-center border-b mb-8">
            <button
              className={`py-3 px-6 ${
                activeTab === "patient"
                  ? "text-gray-800 border-b-2 border-indigo-600 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("patient")}
            >
              Patient
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "pharmacy"
                  ? "text-gray-800 border-b-2 border-indigo-600 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("pharmacy")}
            >
              Pharmacy
            </button>
          </div>

          {/* Render correct form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            {activeTab === "patient" ? <RegisterPatient /> : <RegisterPharmacy />}
          </div>
        </div>
      </main>
    </div>
  );
}
