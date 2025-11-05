import useLocalStorage from "./hooks/useLocalStorage";
import GoalInputForm from "./components/GoalInputForm";
import "./index.css";

function App() {
  const [goalPlan, setGoalPlan] = useLocalStorage("eunoia-goal", null);

  const handleGoalCreated = (newGoal) => {
    setGoalPlan(newGoal);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-10">
        Eunoia: The AI Learning Coach
      </h1>

      <div className="max-w-xl mx-auto">
        {goalPlan ? (
          <div className="text-center p-10 bg-white rounded-xl shadow">
            <h2 className="text-2xl font-semibold">
              Goal: {goalPlan.goalTitle}
            </h2>
            <p className="text-gray-500">Status: {goalPlan.progressStatus}</p>
            <p className="mt-4">Dashboard will be rendered here...</p>

            <button
              onClick={() => setGoalPlan(null)}
              className="mt-4 text-sm text-red-500 hover:text-red-700"
            >
              Start New Goal (Reset)
            </button>
          </div>
        ) : (
          <GoalInputForm onGoalCreated={handleGoalCreated} />
        )}
      </div>
    </div>
  );
}

export default App;
