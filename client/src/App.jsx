import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoalInputForm from "./components/GoalInputForm";
import DashboardContainer from "./components/DashboardContainer";
import DashboardHome from "./pages/DashboardHome";

import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useAuth();
  if (!userInfo) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/goal"
        element={
          <ProtectedRoute>
            <GoalInputForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/:goalId"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
