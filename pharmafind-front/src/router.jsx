// src/router.jsx
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// Layouts - Keep these as regular imports for better performance
import LandingLayout from "./layouts/LandingLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import PatientLayout from "./layouts/PatientLayout.jsx";
import PharmacyLayout from "./layouts/PharmacyLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Components - Keep these as regular imports
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

// Landing views - Lazy load for better performance
const Landing = lazy(() => import("./views/landing/Landing.jsx"));
const About = lazy(() => import("./views/landing/About.jsx"));
const Contact = lazy(() => import("./views/landing/Contact.jsx"));

// Auth views - Lazy load for better performance
const Login = lazy(() => import("./views/auth/Login.jsx"));
const RegisterPatient = lazy(() => import("./views/auth/RegisterPatient.jsx"));
const RegisterPharmacy = lazy(() => import("./views/auth/RegisterPharmacy.jsx"));
const ForgotPassword = lazy(() => import("./views/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./views/auth/ResetPassword.jsx"));
const ResetLinkSent = lazy(() => import("./views/auth/ResetLinkSent.jsx"));
const RegisterOptions = lazy(() => import("./views/auth/RegisterOptions.jsx"));

// Patient views - Lazy load for better performance
const PatientDashboard = lazy(() => import("./views/patient/PatientDashboard.jsx"));
const SearchResult = lazy(() => import("./views/patient/SearchResult.jsx"));
const PatientProfile = lazy(() => import("./views/patient/PatientProfile.jsx"));
const SearchHistoryPage = lazy(() => import("./views/patient/SearchHistoryPage.jsx"));
const InsuranceManagement = lazy(() => import("./views/patient/InsuranceManagement.jsx"));
const Notifications = lazy(() => import("./views/patient/Notifications.jsx"));

// Pharmacy views - Lazy load for better performance
const PharmacyDashboard = lazy(() => import("./views/pharmacy/PharmacyDashboard.jsx"));
const PharmacyEditDetails = lazy(() => import("./views/pharmacy/PharmacyEditDetails.jsx"));
const PharmacyLocationSettings = lazy(() => import("./views/pharmacy/PharmacyLocationSettings.jsx"));
const PharmacyWorkingHours = lazy(() => import("./views/pharmacy/PharmacyWorkingHours.jsx"));
const PharmacyAcceptedInsurances = lazy(() => import("./views/pharmacy/PharmacyAcceptedInsurances.jsx"));
const MedicineManagement = lazy(() => import("./views/pharmacy/MedicineManagement.jsx"));

// Admin views - Lazy load for better performance
const AdminDashboard = lazy(() => import("./views/admin/AdminDashboard.jsx"));
const PharmacyManagement = lazy(() => import("./views/admin/PharmacyManagement.jsx"));
const UserManagement = lazy(() => import("./views/admin/UserManagement.jsx"));
const AdminInsuranceManagement = lazy(() => import("./views/admin/InsuranceManagement.jsx"));
const ContactMessages = lazy(() => import("./views/admin/ContactMessages.jsx"));

// Error - Lazy load
const NotFound = lazy(() => import("./views/NotFound.jsx"));

const router = createBrowserRouter([
  // Landing
  {
    element: <LandingLayout />,
    children: [
      { 
        path: "/", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading home page..." />}>
            <Landing />
          </Suspense>
        )
      },
      { 
        path: "/about", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading about page..." />}>
            <About />
          </Suspense>
        )
      },
      { 
        path: "/contact", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading contact page..." />}>
            <Contact />
          </Suspense>
        )
      },
    ],
  },

  // Auth
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { 
        path: "login", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading login..." />}>
            <Login />
          </Suspense>
        )
      },
      { 
        path: "register", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading registration..." />}>
            <RegisterOptions />
          </Suspense>
        )
      },
      { 
        path: "register-patient", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading patient registration..." />}>
            <RegisterPatient />
          </Suspense>
        )
      },
      { 
        path: "register-pharmacy", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading pharmacy registration..." />}>
            <RegisterPharmacy />
          </Suspense>
        )
      },
      { 
        path: "forgot-password", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading password reset..." />}>
            <ForgotPassword />
          </Suspense>
        )
      },
      { 
        path: "reset-password", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading password reset..." />}>
            <ResetPassword />
          </Suspense>
        )
      },
      { 
        path: "reset-link-sent", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
            <ResetLinkSent />
          </Suspense>
        )
      },
    ],
  },

  // Patient
  {
    path: "/patient",
    element:(<ProtectedRoute allowedRoles={["patient"]}> <PatientLayout /> </ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="/patient/dashboard" /> },
      { 
        path: "dashboard", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading dashboard..." />}>
            <PatientDashboard />
          </Suspense>
        )
      },
      { 
        path: "search-results", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading search results..." />}>
            <SearchResult />
          </Suspense>
        )
      },
      { 
        path: "search-history", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading search history..." />}>
            <SearchHistoryPage />
          </Suspense>
        )
      },
      { 
        path: "profile", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading profile..." />}>
            <PatientProfile />
          </Suspense>
        )
      },
      { 
        path: "insurance", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading insurance management..." />}>
            <InsuranceManagement />
          </Suspense>
        )
      },
      { 
        path: "notifications", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading notifications..." />}>
            <Notifications />
          </Suspense>
        )
      },
    ],
  },

  // Pharmacy
  {
    path: "/pharmacy",
    element:(<ProtectedRoute allowedRoles={["pharmacy_owner"]}> <PharmacyLayout /> </ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="/pharmacy/dashboard" /> },
      { 
        path: "dashboard", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading pharmacy dashboard..." />}>
            <PharmacyDashboard />
          </Suspense>
        )
      },
      { 
        path: "edit-details", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading pharmacy details..." />}>
            <PharmacyEditDetails />
          </Suspense>
        )
      },
      { 
        path: "location-settings", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading location settings..." />}>
            <PharmacyLocationSettings />
          </Suspense>
        )
      },
      { 
        path: "working-hours", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading working hours..." />}>
            <PharmacyWorkingHours />
          </Suspense>
        )
      },
      { 
        path: "insurances", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading insurance settings..." />}>
            <PharmacyAcceptedInsurances />
          </Suspense>
        )
      },
      { 
        path: "medicines", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading medicine management..." />}>
            <MedicineManagement />
          </Suspense>
        )
      },
    ],
  },

  // Admin
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" /> },
      { 
        path: "dashboard", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading admin dashboard..." />}>
            <AdminDashboard />
          </Suspense>
        )
      },
      { 
        path: "pharmacies", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading pharmacy management..." />}>
            <PharmacyManagement />
          </Suspense>
        )
      },
      { 
        path: "users", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading user management..." />}>
            <UserManagement />
          </Suspense>
        )
      },
      { 
        path: "insurances", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading insurance management..." />}>
            <AdminInsuranceManagement />
          </Suspense>
        )
      },
      { 
        path: "messages", 
        element: (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading contact messages..." />}>
            <ContactMessages />
          </Suspense>
        )
      },
      { path: "analytics", element: <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-gray-600">Coming soon...</p></div> },
      { path: "settings", element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600">Coming soon...</p></div> },
    ],
  },

  // Catch-all
  { 
    path: "*", 
    element: (
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
        <NotFound />
      </Suspense>
    )
  },
  
]);

export default router;
