"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Plus } from "lucide-react";
import "../styles/dashboard.css";

export default function DashboardContainer() {
  const { goalId } = useParams();
  const [goalData, setGoalData] = useState(null);
  const [modules, setModules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsState, setSuggestionsState] = useState({
    loading: false,
    fetched: false,
    error: null,
  });
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchGoal = useCallback(async () => {
    try {
      const res = await fetch(`/api/goals/${goalId}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to fetch goal");

      const goal = json.data;
      setGoalData(goal);

      const sorted = [...goal.moduleIds].sort(
        (a, b) => (a.order ?? 999) - (b.order ?? 999)
      );
      setModules(sorted);
    } catch (e) {
      console.error("Fetch goal failed:", e);
    }
  }, [goalId]);

  useEffect(() => {
    if (!goalId) return;
    fetchGoal();
  }, [goalId, fetchGoal]);

  const handleModuleToggle = async (moduleId) => {
    const target = modules.find((m) => m._id === moduleId);
    if (!target) return;

    const newState = !target.isCompleted;

    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newState }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("Module update failed:", json);
        return;
      }

      setModules((prev) =>
        prev.map((m) =>
          m._id === moduleId ? { ...m, isCompleted: newState } : m
        )
      );

      await fetchGoal();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const originalModules = modules.filter((m) => !m.isAdaptive);
  const originalComplete =
    originalModules.length > 0 && originalModules.every((m) => m.isCompleted);

  useEffect(() => {
    if (
      !originalComplete ||
      suggestionsState.fetched ||
      suggestionsState.loading
    )
      return;

    async function loadSuggestions() {
      setSuggestionsState({ loading: true, fetched: false, error: null });
      try {
        const res = await fetch(`/api/suggestions/${goalId}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch suggestions");
        }

        setSuggestions(Array.isArray(json.data) ? json.data : []);
        setSuggestionsState({ loading: false, fetched: true, error: null });
      } catch (err) {
        console.error("Suggestions fetch failed:", err);
        setSuggestionsState({
          loading: false,
          fetched: true,
          error: err.message || "Failed to fetch suggestions",
        });
      }
    }

    loadSuggestions();
  }, [
    originalComplete,
    goalId,
    suggestionsState.fetched,
    suggestionsState.loading,
  ]);

  const handleAcceptSuggestion = async (suggestion) => {
    if (!suggestion) return;
    if (acceptedIds.has(suggestion.title)) return;

    setAcceptingId(suggestion.title);
    try {
      const res = await fetch(`/api/suggestions/${goalId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to accept suggestion");
      }

      const newModule = json.data;

      setModules((prev) =>
        [...prev, newModule].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      );

      setAcceptedIds((prev) => {
        const s = new Set(prev);
        s.add(suggestion.title);
        return s;
      });

      await fetchGoal();
    } catch (err) {
      console.error("Accept suggestion failed:", err);
    } finally {
      setAcceptingId(null);
    }
  };

  if (!goalData) {
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

  const getResourceIcon = (typeRaw) => {
    const type = (typeRaw || "OTHER").toLowerCase();
    const icons = {
      video: "▶️",
      article: "📝",
      blog: "📝",
      book: "📚",
      course: "🎓",
      other: "🔗",
    };
    return icons[type] || "🔗";
  };

  const safeUrlHostname = (url) => {
    try {
      if (url && url.startsWith("http")) {
        return new URL(url).hostname;
      }
    } catch {
      return "...";
    }
    return "Unknown Source";
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-30" />
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-20"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse opacity-20"
          style={{ animationDelay: "2s" }}
        />
      </div>

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

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 relative z-10">
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
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-16 mt-16">
          {modules.map((mod, index) => (
            <div key={mod._id} className="group">
              <div className="flex items-start gap-8 mb-8">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg" />
                  <div className="relative w-20 h-20 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center ai-glow">
                    <span className="text-3xl font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex-grow pt-2">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-3xl font-bold">{mod.title}</h2>

                    <button
                      onClick={() => handleModuleToggle(mod._id)}
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

              {Array.isArray(mod.resourceIds) && mod.resourceIds.length > 0 && (
                <div className="bg-card/50 border border-border/30 rounded-2xl p-8 backdrop-blur-sm">
                  <h3 className="font-semibold text-sm uppercase tracking-widest text-primary mb-6">
                    Resources
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {mod.resourceIds.map((res, idx) => {
                      const category = res.sourceType || res.type || "OTHER";
                      const safeHref =
                        res.url && res.url.startsWith("http") ? res.url : "#";
                      const isExternal =
                        typeof safeHref === "string" &&
                        safeHref.startsWith("http");

                      const inner = (
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {getResourceIcon(category)}
                          </div>

                          <div className="flex-grow">
                            <div className="font-semibold group-hover:text-primary transition">
                              {res.title ||
                                res.name ||
                                safeUrlHostname(res.url)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {(category || "other").toLowerCase()}
                            </div>
                          </div>

                          <ArrowRight
                            size={18}
                            className="text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition"
                          />
                        </div>
                      );

                      return isExternal ? (
                        <a
                          key={idx}
                          href={safeHref}
                          target="_blank"
                          rel="noreferrer"
                          className="relative bg-background/50 border border-border rounded-xl p-5 hover:border-primary/50 transition group overflow-hidden"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div
                          key={idx}
                          className="relative bg-background/50 border border-border rounded-xl p-5 transition group overflow-hidden"
                        >
                          {inner}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {index < modules.length - 1 && (
                <div className="mt-16 flex items-center gap-4">
                  <div className="flex-grow h-px bg-border/50" />
                  <div className="text-primary/40 font-semibold">·</div>
                  <div className="flex-grow h-px bg-border/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {originalComplete && (
          <div className="mt-24 animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-background p-10 text-center mb-8 group">
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center ai-glow mb-2">
                  <span className="text-3xl">🎯</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-4xl font-bold text-primary tracking-tight">
                    🎉 Roadmap Complete!
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Great job. Here are focused next steps you can add to your
                    path.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold">Recommended Next Steps</h3>
              </div>

              {suggestionsState.loading && (
                <div className="text-sm text-muted-foreground">
                  Loading recommendations...
                </div>
              )}

              {suggestionsState.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
                  {suggestionsState.error}
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((sugg, i) => {
                  const added = acceptedIds.has(sugg.title);
                  const isAccepting = acceptingId === sugg.title;
                  return (
                    <div
                      key={sugg.title + i}
                      className="group relative flex flex-col bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="p-6 flex flex-col h-full gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                              {sugg.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {sugg.difficulty || "INTERMEDIATE"}
                              </span>
                              <span>•</span>
                              <span>{sugg.estimatedHours ?? "—"} hrs</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {sugg.description}
                        </p>

                        <div className="mt-auto pt-4 space-y-4">
                          <div className="space-y-2">
                            {(sugg.resources || [])
                              .slice(0, 2)
                              .map((r, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-muted-foreground/80"
                                >
                                  <div className="w-1 h-1 rounded-full bg-primary/50" />
                                  <span className="truncate">{r.title}</span>
                                </div>
                              ))}
                          </div>

                          <button
                            onClick={() => handleAcceptSuggestion(sugg)}
                            disabled={added || isAccepting}
                            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                              added
                                ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                            }`}
                          >
                            {added ? (
                              <>
                                <CheckCircle2 size={18} />
                                <span>Added</span>
                              </>
                            ) : isAccepting ? (
                              <>
                                <span className="animate-spin">⟳</span>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={18} />
                                <span>Add to Roadmap</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!suggestionsState.loading && suggestions.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No recommendations available right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex gap-4 justify-center flex-wrap pt-12 border-t border-border/50">
          <a
            href="/"
            className="px-8 py-3 border border-primary/30 rounded-lg hover:border-primary/60 hover:bg-primary/5 transition font-semibold text-sm relative group"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
