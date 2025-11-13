import React, { useState } from "react";
import { toggleModule } from "../lib/api";

export default function ModuleCard({
  module,
  onLocalUpdate,
  onProgressUpdate,
}) {
  const [isCompleted, setIsCompleted] = useState(module.isCompleted);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    try {
      const { module: updated, progress } = await toggleModule(
        module._id,
        !isCompleted
      );

      setIsCompleted(updated.isCompleted);

      if (onLocalUpdate) onLocalUpdate(updated);
      if (onProgressUpdate) onProgressUpdate(progress);
    } catch (err) {
      console.error("Module toggle failed:", err);
      alert("Something went wrong while updating module progress.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col gap-4 border rounded-lg p-6 transition-all duration-300 ease-out netflix-card ${
        isCompleted
          ? "bg-primary/10 border-primary/50 opacity-90"
          : "bg-card border-border hover:scale-[1.02] hover:shadow-xl hover:border-accent/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`text-xl font-semibold tracking-tight ${
            isCompleted ? "line-through text-primary/60" : "text-foreground"
          }`}
        >
          {module.title}
        </h3>

        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            disabled={saving}
            className="sr-only peer"
          />
          <div
            className={`w-12 h-6 rounded-full transition-colors duration-300 ${
              isCompleted
                ? "bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_rgba(255,0,0,0.5)]"
                : "bg-input"
            } ${saving ? "opacity-70 cursor-wait" : ""}`}
          ></div>
          <span
            className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-foreground transition-all duration-300 ${
              isCompleted
                ? "translate-x-6 bg-accent"
                : "translate-x-0 bg-foreground"
            }`}
          ></span>
        </label>
      </div>

      <p
        className={`text-sm leading-relaxed transition-colors duration-200 ${
          isCompleted
            ? "text-foreground/50"
            : "text-foreground/80 hover:text-foreground"
        }`}
      >
        {module.description}
      </p>

      <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="text-xs text-right text-foreground/50 italic">
        {saving
          ? "Saving progress..."
          : isCompleted
          ? "Completed"
          : "In progress"}
      </div>
    </div>
  );
}
