"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Layout, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchMyGoals } from "../lib/api";

export default function DashboardHome() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuth();

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await fetchMyGoals();
        setGoals(data || []);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse opacity-20"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
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
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              Welcome back, {userInfo?.name}
            </span>
            <Link
              to="/goal"
              className="bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <Plus size={16} />

              <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Layout className="text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Your Learning Paths
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 border border-border border-dashed rounded-2xl bg-card/30 mx-4">
            <h3 className="text-2xl font-bold mb-2">No roadmaps yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first learning journey today.
            </p>
            <Link
              to="/goal"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Create Roadmap <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Link
                key={goal._id}
                to={`/dashboard/${goal._id}`}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    {goal.userLevel}
                  </div>
                  {goal.progressStatus === "COMPLETED" && (
                    <div className="text-green-500 text-xs font-bold">Done</div>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {goal.goalTitle}
                </h3>

                <div className="mt-auto pt-6 flex items-center justify-between text-muted-foreground text-sm border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 group-hover:text-primary transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
