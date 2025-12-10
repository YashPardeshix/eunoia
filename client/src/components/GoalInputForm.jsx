"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Zap, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createGoal } from "../lib/api";

export default function GoalInputForm() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const levelMap = {
    beginner: "BEGINNER",
    intermediate: "INTERMEDIATE",
    advanced: "ADVANCED",
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !level) {
      setError("Please enter a topic and select a level");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newGoal = await createGoal(topic.trim(), levelMap[level]);

      navigate(`/dashboard/${newGoal._id}`);
    } catch (err) {
      console.error("API Error:", err);

      const errorMessage = err.response?.data?.message || err.message || "";

      if (errorMessage.includes("AI returned invalid JSON")) {
        setError(
          "Our AI provider is overloaded right now. Please wait a moment and try again."
        );
        return;
      }

      if (
        errorMessage.includes("Unexpected end of JSON input") ||
        errorMessage.includes("502")
      ) {
        setError(
          "The server did not respond correctly. Please try again in a few seconds."
        );
        return;
      }

      setError(
        errorMessage || "Something went wrong while generating your roadmap."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition group"
          >
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center relative group-hover:ai-glow transition">
              <span className="font-bold text-primary-foreground text-lg">
                E
              </span>
              <span className="absolute top-0 right-0 text-primary-foreground text-xs">
                ✦
              </span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">EunoiaAI</span>
          </a>
          <a
            href="/"
            className="text-muted-foreground hover:text-primary transition text-sm font-medium relative group"
          >
            Back to Home
            <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300"></span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your Personalized Roadmap
          </h1>
          <p className="text-lg text-muted-foreground">
            Eunoia builds an AI-powered roadmap tailored to how you learn best.
          </p>
        </div>

        <div className="bg-card/50 border border-border/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl"></div>

          <div className="relative space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="group/input">
              <label className="block text-sm font-semibold mb-3 uppercase tracking-wider text-primary">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python, Web Development, Machine Learning..."
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3"
              />
              <p className="text-muted-foreground text-sm mt-2">
                Be as specific as possible for better results
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 uppercase tracking-wider text-primary">
                What's your current level?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["beginner", "intermediate", "advanced"].map((lvl) => (
                  <button
                    key={lvl}
                    onMouseEnter={() => setHoveredLevel(lvl)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    onClick={() => setLevel(lvl)}
                    className={`relative p-4 rounded-lg border-2 transition font-semibold capitalize text-sm overflow-hidden group ${
                      level === lvl
                        ? "border-primary bg-primary/10 text-primary ai-glow"
                        : `border-border bg-background hover:border-primary/50 ${
                            hoveredLevel === lvl ? "ai-glow" : ""
                          }`
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim() || !level}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span> Generating...
                </>
              ) : (
                <>
                  Generate Roadmap <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4 pt-8 border-t border-border/30">
            {[
              {
                icon: Zap,
                title: "AI-Powered",
                desc: "Personalized to your goals",
              },
              {
                icon: BookOpen,
                title: "Curated Resources",
                desc: "Videos, books, blogs, and tutorials",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1 group-hover:text-primary">
                    {item.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
