import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "@/components/Navbar";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import { Toaster } from "sonner";
import ManageUsers from "@/pages/ManageUsers";
import CreateFeedback from "@/pages/CreateFeedback";
import FeedbackHistoryPage from "./pages/FeedbackHistory";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route
              path="/feedback/create/:userId"
              element={<CreateFeedback />}
            />
            <Route
              path="/feedback/history/:userId"
              element={<FeedbackHistoryPage />}
            />

            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
