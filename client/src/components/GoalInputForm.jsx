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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="goalTitle">Goal Title</label>
        <input
          type="text"
          id="goalTitle"
          name="goalTitle"
          value={formData.goalTitle}
          onChange={handleChange}
          placeholder="Enter your goal"
          required
        />
      </div>

      <div>
        <label htmlFor="userLevel">Experience Level</label>
        <select
          id="userLevel"
          name="userLevel"
          value={formData.userLevel}
          onChange={handleChange}
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <button type="submit">Generate Roadmap</button>
    </form>
  );
};

export default GoalInputForm;
