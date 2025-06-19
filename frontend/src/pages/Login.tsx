import { useState } from "react";
import axios from "@/services/api";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      if (resp.status === 200) {
        navigate("/dashboard"); // ✅ Redirect after login
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Login to FeedForward</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button className="gap-2 w-full" onClick={handleLogin}>
          <User className="h-4 w-4" />
          Login
        </Button>
      </div>
    </main>
  );
}
