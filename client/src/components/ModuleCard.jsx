import React from "react";

const ModuleCard = ({ module, onToggle }) => {
  return (
    <div>
      <div>
        <h3>{module.title}</h3>
        <input
          type="checkbox"
          checked={module.isCompleted}
          onChange={() => onToggle(module._id)}
        />
      </div>
      <p>{module.description}</p>
    </div>
  );
};

export default ModuleCard;
