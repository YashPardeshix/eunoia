import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function createGoal(goalTitle, userLevel = "BEGINNER") {
  const res = await API.post("/goals", { goalTitle, userLevel });
  return res.data.data;
}

export async function fetchModulesByGoal(goalId) {
  const res = await API.get(`/modules/goal/${goalId}`);
  return res.data.data;
}

export async function toggleModule(moduleId, isCompleted) {
  const res = await API.put(`/modules/${moduleId}`, { isCompleted });
  return res.data.data;
}
