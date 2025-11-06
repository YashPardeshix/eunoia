import React, { useState } from "react";
import axios from "axios";
import mockModules from "../data/mockModules";
import ModuleCard from "./ModuleCard";

const DashboardContainer = ({ goalPlan, onGoalUpdate }) => {
  const [modules, setModules] = useState(mockModules);

  const handleModuleToggle = async (moduleId) => {
    const moduleToToggle = modules.find((m) => m._id === moduleId);
    if (!moduleToToggle) return;
    const newCompletedState = !moduleToToggle.isCompleted;

    const updatedModules = modules.map((m) =>
      m._id === moduleId ? { ...m, isCompleted: newCompletedState } : m
    );
    setModules(updatedModules);

    try {
      await axios.put(`/api/modules/${moduleId}`, {
        isCompleted: newCompletedState,
      });

      onGoalUpdate();
    } catch (error) {
      console.error("Update failed, reverting UI:", error);
      alert("Failed to update module. Please check server logs.");

      setModules(modules);
    }
  };

  return (
    <div>
      <h2>Goal: {goalPlan.goalTitle}</h2>

      {modules.map((module) => (
        <ModuleCard
          key={module._id}
          module={module}
          onToggle={handleModuleToggle}
        />
      ))}
    </div>
  );
};

export default DashboardContainer;
