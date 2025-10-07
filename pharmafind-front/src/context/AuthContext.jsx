// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Since we're using Vite proxy, we can use relative URLs
  const API_BASE = "";

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single useEffect for authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      console.log("Auth initialization - savedToken:", !!savedToken, "savedUser:", !!savedUser);

      // If no token exists, skip verification
      if (!savedToken) {
        console.log("No saved token found, Skiping verification")
        setLoading(false);
        return;
      }

      try {
        console.log("Verifying token with API...");
        console.log("Token being verified:", savedToken ? savedToken.substring(0, 20) + '...' : 'none');
        // Use the standard /api/user endpoint for token verification
        const res = await fetch(`${API_BASE}/api/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${savedToken}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });
        console.log("Token verification response status:", res.status);

        if (res.ok) {
          // Token is valid - get user data
          const userData = await res.json();
          console.log("Token valid, user data:", userData);
          setUser(userData);
          setToken(savedToken);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", savedToken);
        } else {
          // Token is invalid
          console.warn("Token verification failed, clearing storage");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [API_BASE]);

  // LOGIN function
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      const ct = res.headers.get("content-type") || "";

      if (!ct.includes("application/json")) {
        console.error("Non-JSON login response:", text);
        throw new Error("Server did not return JSON. Check API route/CORS.");
      }

      const data = JSON.parse(text);
      console.log("Login API response:", data);
      if (!res.ok) throw new Error(data.message || "Login failed");

          // Handle different API response shapes
    const userData = data.user || data.data || null;
    const authToken = data.token || data.access_token || null;

    if (!userData || !authToken) {
      throw new Error("Invalid login response structure");
    }


      // Save user + token
      console.log("Saving to localStorage - userData:", userData);
      console.log("Saving to localStorage - authToken:", authToken ? authToken.substring(0, 20) + '...' : 'none');
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      console.log("localStorage after save - user:", localStorage.getItem("user") ? 'exists' : 'missing');
      console.log("localStorage after save - token:", localStorage.getItem("token") ? 'exists' : 'missing');

      console.log("Login successful, user role:", userData.role);

      return userData;

    } catch (error) {
      console.error("Login error:", error.message);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/api/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  // REGISTER
  const register = async (payload, role = "patient") => {
    try {
      const endpoint =
        role === "pharmacy_owner"
          ? `${API_BASE}/api/register/pharmacy`
          : `${API_BASE}/api/register/patient`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const ct = res.headers.get("content-type") || "";

      if (!ct.includes("application/json")) {
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Registration failed");

      return data;
    } catch (error) {
      console.error("Register error:", error.message);
      throw error;
    }
  };

  // UPDATE USER - Update user data in context and localStorage
  const updateUser = (newUserData) => {
    console.log("Updating user data:", newUserData);
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        updateUser,
        loading,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};