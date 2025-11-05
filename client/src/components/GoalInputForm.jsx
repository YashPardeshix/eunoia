import React, { useState } from "react";
import axios from "axios";

const GoalInputForm = ({ onGoalCreated }) => {
  const [formData, setFormData] = useState({
    goalTitle: "",
    userLevel: "BEGINNER",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/goals", formData);
      alert("Goal created successfully!");
      onGoalCreated(response.data.data);
      setFormData({ goalTitle: "", userLevel: "BEGINNER" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unknown error occurred";
      console.error("API Error:", errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-md space-y-6"
    >
      <div>
        <label
          htmlFor="goalTitle"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Goal Title
        </label>
        <input
          type="text"
          id="goalTitle"
          name="goalTitle"
          value={formData.goalTitle}
          onChange={handleChange}
          placeholder="Enter your goal"
          required
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="userLevel"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Experience Level
        </label>
        <select
          id="userLevel"
          name="userLevel"
          value={formData.userLevel}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
      >
        Generate Roadmap
      </button>
    </form>
  );
};

export default GoalInputForm;
