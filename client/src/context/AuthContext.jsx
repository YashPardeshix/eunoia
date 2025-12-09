import { createContext, useState, useContext } from "react";
import { loginUser, registerUser, logoutUser } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });

      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      console.error("Login Error:", err);

      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerUser({ name, email, password });

      setUserInfo(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (err) {
      console.error("Registration Error:", err);
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
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
