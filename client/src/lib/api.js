import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function createGoal(goalTitle, userLevel = "BEGINNER") {
  const res = await API.post("/goals", { goalTitle, userLevel });
  return res.data.data;
}

export async function fetchMyGoals() {
  const res = await API.get("/goals/mygoals");
  return res.data.data;
}

export async function fetchGoalById(goalId) {
  const res = await API.get(`/goals/${goalId}`);
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

export async function registerUser(userData) {
  const res = await API.post("/users", userData);
  return res.data;
}

export async function loginUser(userData) {
  const res = await API.post("/users/auth", userData);
  return res.data;
}

export async function logoutUser() {
  const res = await API.post("/users/logout");
  return res.data;
}

export async function generateSuggestions(goalId) {
  const res = await API.post(`/suggestions/${goalId}/generate`);
  return res.data.data;
}

export async function acceptSuggestion(goalId, suggestion) {
  const res = await API.post(`/suggestions/${goalId}/accept`, { suggestion });
  return res.data.data;
}

export default API;
