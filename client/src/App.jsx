import React from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import GoalInputForm from "./components/GoalInputForm";
import DashboardContainer from "./components/DashboardContainer";
import "./index.css";

function App() {
  const [goalPlan, setGoalPlan] = useLocalStorage("eunoia-goal", null);

  const handleGoalCreated = (newGoal) => {
    setGoalPlan(newGoal);
  };

  return (
    <div>
      <h1>Eunoia: The AI Learning Coach</h1>

      <div>
        {goalPlan ? (
          <DashboardContainer
            goalPlan={goalPlan}
            onGoalUpdate={() => setGoalPlan({ ...goalPlan })}
          />
        ) : (
          <GoalInputForm onGoalCreated={handleGoalCreated} />
        )}
      </div>
    </div>
  );
}

export default App;
