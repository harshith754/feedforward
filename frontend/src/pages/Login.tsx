import { useState, useContext } from "react";
import axios from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const resp = await axios.post(
        "/api/auth/login",
        { username, password },
        { withCredentials: true }
      );
      setUser(resp.data);
      toast("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-start px-4 py-12 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6">
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

        <Button
          className="gap-2 w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Log In
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
