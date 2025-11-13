"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/landing-page.css";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
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

      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center relative ai-glow">
              <span className="font-bold text-primary-foreground text-lg">
                E
              </span>
              <span className="absolute top-0 right-0 text-primary-foreground text-xs">
                ✦
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition">
              EunoiaAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-primary transition text-sm relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-primary transition text-sm relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-primary transition text-sm relative group"
            >
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-foreground px-4 py-2 rounded-lg hover:text-primary hover:border-primary/50 transition font-semibold text-sm border border-border group relative">
              <span className="relative z-10">Sign In</span>
              <span className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition"></span>
            </button>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold text-sm ai-glow">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 md:px-0 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-3xl">
              <div
                className={`inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/30 backdrop-blur ${
                  mounted ? "opacity-100" : "opacity-0"
                } transition-all duration-700 hover:border-primary/60 hover:bg-primary/15 cursor-pointer group`}
              >
                <span className="text-primary font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary pulse-glow"></span>
                  AI-Powered Learning Paths
                </span>
              </div>

              <h1
                className={`text-5xl md:text-6xl font-bold mb-6 leading-tight text-balance ${
                  mounted ? "opacity-100" : "opacity-0"
                } transition-all duration-700`}
                style={{ transitionDelay: mounted ? "0.1s" : "0s" }}
              >
                Learn{" "}
                <span className="relative inline-block text-primary">
                  Anything
                  <span className="absolute inset-0 bg-primary/20 blur-lg -z-10"></span>
                  <span className="text-white">,</span>
                </span>
                <br />
                Build Your Path
              </h1>

              <p
                className={`text-lg text-muted-foreground mb-8 text-balance leading-relaxed ${
                  mounted ? "opacity-100" : "opacity-0"
                } transition-all duration-700`}
                style={{ transitionDelay: mounted ? "0.2s" : "0s" }}
              >
                Type what you want to learn. Select your level. Get a
                personalized roadmap with curated resources—videos, books,
                blogs, and more. All powered by AI.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center ${
                  mounted ? "opacity-100" : "opacity-0"
                } transition-all duration-700`}
                style={{ transitionDelay: mounted ? "0.3s" : "0s" }}
              >
                <Link
                  to="/goal"
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 group ai-glow hover:scale-105 transform duration-200"
                >
                  Get Started{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>
                <a
                  href="#how-it-works"
                  className="border border-primary/50 px-8 py-3 rounded-lg hover:bg-primary/5 hover:border-primary/80 transition font-semibold hover:scale-105 transform duration-200"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-20 px-6 md:px-0 bg-secondary relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master any skill
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group cursor-pointer relative overflow-hidden hover:scale-105 transform duration-300">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:ai-glow transition relative z-10">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 relative z-10">
                AI-Powered Roadmaps
              </h3>
              <p className="text-muted-foreground relative z-10">
                Intelligent algorithms analyze millions of resources to create
                your perfect learning path
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group cursor-pointer relative overflow-hidden hover:scale-105 transform duration-300">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:ai-glow transition relative z-10">
                <BookOpen size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 relative z-10">
                Curated Resources
              </h3>
              <p className="text-muted-foreground relative z-10">
                Videos, books, blogs, and tutorials from trusted sources—all in
                one place
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group cursor-pointer relative overflow-hidden hover:scale-105 transform duration-300">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition blur-xl"></div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:ai-glow transition relative z-10">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 relative z-10">
                Skill Levels
              </h3>
              <p className="text-muted-foreground relative z-10">
                Learn at your own pace with content tailored to beginners,
                intermediate, or advanced
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 md:px-0 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start learning
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-bold text-primary hover:bg-primary/30 transition ai-glow cursor-pointer hover:scale-110 transform duration-300">
                  1
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-2">
                  Enter Your Learning Goal
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Type what you want to learn—Python, Web Development, Machine
                  Learning, Data Science, or anything else. Be as specific as
                  you want.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-2/3 order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-2">Choose Your Level</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select whether you're a Beginner, Intermediate, or Advanced
                  learner. Your roadmap will be tailored to your expertise
                  level.
                </p>
              </div>
              <div className="md:w-1/3 flex items-center justify-center order-1 md:order-2">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-bold text-primary hover:bg-primary/30 transition ai-glow cursor-pointer hover:scale-110 transform duration-300">
                  2
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-bold text-primary hover:bg-primary/30 transition ai-glow cursor-pointer hover:scale-110 transform duration-300">
                  3
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-2">
                  Get Your Personalized Roadmap
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI generates a comprehensive roadmap with modules,
                  learning objectives, and curated resources from books, videos,
                  and blogs. Start learning immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-0 bg-secondary border-t border-border relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Join thousands of learners creating personalized paths to mastery.
          </p>
          <Link
            to="/goal"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold inline-flex items-center gap-2 group ai-glow hover:scale-105 transform duration-200"
          >
            Get Started Now{" "}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition"
            />
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center relative ai-glow">
              <span className="font-bold text-primary-foreground text-sm">
                E
              </span>
              <span className="absolute top-0 right-0 text-primary-foreground text-xs">
                ✦
              </span>
            </div>
            <span className="font-bold group-hover:text-primary transition">
              EunoiaAI
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 EunoiaAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <a
              href="#"
              className="hover:text-primary transition relative group"
            >
              Privacy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#"
              className="hover:text-primary transition relative group"
            >
              Terms
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#"
              className="hover:text-primary transition relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
