import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);


function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [email, setEmail] = useState(localStorage.getItem("email"));

  async function login(loginEmail, password) {
    const data = await api.login(loginEmail, password);
    const payload = decodeToken(data.access_token);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", payload?.role || "");
    localStorage.setItem("email", loginEmail);

    setToken(data.access_token);
    setRole(payload?.role || "");
    setEmail(loginEmail);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    setToken(null);
    setRole(null);
    setEmail(null);
  }

  const value = {
    token,
    role,
    email,
    isAuthenticated: !!token,
    isAdmin: role === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
