"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import "../styles/dashboard.css";

export default function DashboardContainer() {
  const { goalId } = useParams();

  const [goalData, setGoalData] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. fetch goal details
        const goalRes = await fetch(`/api/goals/${goalId}`);
        const goalJson = await goalRes.json();

        if (!goalRes.ok) throw new Error(goalJson.message);
        const goal = goalJson.data;

        // 2. fetch modules
        const modulesRes = await fetch(`/api/modules/goal/${goalId}`);
        const modulesJson = await modulesRes.json();

        if (!modulesRes.ok) throw new Error(modulesJson.message);

        const modulesList = modulesJson.data;

        // 3. fetch resources for each module
        const modulesWithResources = await Promise.all(
          modulesList.map(async (module) => {
            const res = await fetch(`/api/resources/module/${module._id}`);
            const resJson = await res.json();
            return {
              id: module._id,
              title: module.title,
              description: module.description,
              isCompleted: module.isCompleted,
              order: module.order,
              resources: resJson.data.map((r) => ({
                title: r.title,
                url: r.url,
                type: r.sourceType?.toLowerCase() || "other",
                description: r.description,
              })),
            };
          })
        );

        setGoalData(goal);
        setModules(modulesWithResources);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [goalId]);

  const handleModuleToggle = async (moduleId) => {
    const target = modules.find((m) => m.id === moduleId);
    if (!target) return;

    const newState = !target.isCompleted;

    try {
      await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newState }),
      });

      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, isCompleted: newState } : m
        )
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  if (loading || !goalData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center text-xl">
        Loading your roadmap...
      </div>
    );
  }

  const completed = modules.filter((m) => m.isCompleted).length;
  const progress = modules.length
    ? Math.round((completed / modules.length) * 100)
    : 0;

  const getResourceIcon = (type) => {
    const icons = {
      video: "▶️",
      book: "📚",
      blog: "📝",
      course: "🎓",
      other: "🔗",
    };
    return icons[type] || "🔗";
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-20"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse opacity-20"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition group"
          >
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center relative ai-glow">
              <span className="font-bold text-primary-foreground text-lg">
                E
              </span>
              <span className="absolute top-0 right-0 text-primary-foreground text-xs">
                ✦
              </span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">EunoiaAI</span>
          </a>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 relative z-10">
        {/* Title */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/30 backdrop-blur">
            <span className="text-primary font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {goalData.userLevel} Level
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-balance">
            {goalData.goalTitle}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personalized learning roadmap with curated resources
          </p>
        </div>

        {/* Progress bar */}
        {modules.length > 0 && (
          <div className="w-full bg-card/50 border border-border/30 rounded-2xl p-8 backdrop-blur-sm group">
            <div className="relative space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Your Progress</h3>
                <div className="text-3xl font-bold text-primary">
                  {progress}%
                </div>
              </div>

              <div className="h-3 bg-background rounded-full border border-border/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Modules */}
        <div className="space-y-16 mt-16">
          {modules.map((mod, index) => (
            <div key={mod.id} className="group">
              <div className="flex items-start gap-8 mb-8">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg"></div>
                  <div className="relative w-20 h-20 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center ai-glow">
                    <span className="text-3xl font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex-grow pt-2">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-3xl font-bold">{mod.title}</h2>

                    {/* Completion Toggle */}
                    <button
                      onClick={() => handleModuleToggle(mod.id)}
                      className={`p-2 rounded-lg transition-all ${
                        mod.isCompleted
                          ? "bg-primary/20 text-primary ai-glow"
                          : "bg-border/30 text-muted-foreground hover:bg-border/50 hover:text-primary"
                      }`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </div>

                  <p className="text-muted-foreground text-lg">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Resources */}
              {mod.resources.length > 0 && (
                <div className="bg-card/50 border border-border/30 rounded-2xl p-8 backdrop-blur-sm">
                  <h3 className="font-semibold text-sm uppercase tracking-widest text-primary mb-6">
                    Resources
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {mod.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        className="relative bg-background/50 border border-border rounded-xl p-5 hover:border-primary/50 transition group overflow-hidden"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {getResourceIcon(res.type)}
                          </div>

                          <div className="flex-grow">
                            <div className="font-semibold group-hover:text-primary transition">
                              {res.title}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {res.type}
                            </div>
                          </div>

                          <ArrowRight
                            size={18}
                            className="text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition"
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {index < modules.length - 1 && (
                <div className="mt-16 flex items-center gap-4">
                  <div className="flex-grow h-px bg-border/50"></div>
                  <div className="text-primary/40 font-semibold">·</div>
                  <div className="flex-grow h-px bg-border/50"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
