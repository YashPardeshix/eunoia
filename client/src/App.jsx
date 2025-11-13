import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import GoalInputForm from "./components/GoalInputForm";
import DashboardContainer from "./components/DashboardContainer";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/goal" element={<GoalInputForm />} />
      <Route path="/dashboard/:goalId" element={<DashboardContainer />} />
    </Routes>
  );
}
