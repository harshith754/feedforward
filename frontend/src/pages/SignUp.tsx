import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "@/services/api";
import { Button } from "@/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "developer">("developer");
  const [managerId, setManagerId] = useState<number | undefined>(undefined);
  const [managers, setManagers] = useState<{ id: number; full_name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchManagers() {
      // Always fetch managers so developer can select one
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/managers`,
          {
            withCredentials: true,
          }
        );
        setManagers(resp.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchManagers();
  }, []);

  async function handleSignUp() {
    setLoading(true);
    try {
      const payload: any = {
        username,
        password,
        full_name: fullName,
        role,
      };
      if (role === "developer") {
        payload.manager_id = managerId;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        payload,
        {
          withCredentials: true,
        }
      );
      toast("User registered successfully! Logging you in...");

      const loginResp = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      if (loginResp.status === 200) {
        setUser(loginResp.data);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast("Error signing up. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-start px-4 py-12 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-center">Create Your Account</h1>

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
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Select
          value={role}
          onValueChange={(val) => setRole(val as "manager" | "developer")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>

        {role === "developer" && managers.length > 0 && (
          <Select
            value={managerId?.toString()}
            onValueChange={(val) => setManagerId(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {managers
                .filter((m) => m.id !== managerId) // Prevent selecting self as manager
                .map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.full_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        <Button
          className="gap-2 w-full"
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Sign Up
            </>
          )}
        </Button>
      </div>
    </main>
  );
}
