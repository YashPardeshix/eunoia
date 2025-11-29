import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      console.error("Registration Error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      localStorage.removeItem("userInfo");
      setUserInfo(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
