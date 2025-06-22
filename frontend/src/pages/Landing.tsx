"use client";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LayoutDashboard, MessageSquareHeart, ShieldCheck, User } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-between py-20 px-6">
      {/* Hero Section */}
      <section className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Build a Culture of Continuous Growth
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl">
          FeedForward helps managers and team members share structured, ongoing feedback — clearly, securely, and respectfully.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              <User className="h-4 w-4" />
              Register
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="gap-2">
              <User className="h-4 w-4" />
              Log In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="mt-24 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">Role-Based Dashboards</h3>
          <p className="text-muted-foreground text-sm">
            Managers and employees each get personalized views tailored to their feedback journey.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <MessageSquareHeart className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">Structured, Safe Feedback</h3>
          <p className="text-muted-foreground text-sm">
            Strengths, areas to improve, and sentiment — all captured with clarity and care.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">Secure & Private</h3>
          <p className="text-muted-foreground text-sm">
            Only managers and respective team members can access their feedback, securely stored and acknowledged.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} FeedForward. Built for better feedback.
      </footer>
    </main>
  );
}
