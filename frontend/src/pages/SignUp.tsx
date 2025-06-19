import { useState, useEffect } from "react";
import axios from "@/services/api";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
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
  const [role, setRole] = useState<"manager" | "developer">("developer");
  const [managerId, setManagerId] = useState<number | undefined>(undefined);
  const [managers, setManagers] = useState<{ id: number; username: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchManagers() {
      if (role === "developer") {
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
    }
    fetchManagers();
  }, [role]);

  async function handleSignUp() {
    try {
      const payload: any = {
        username,
        password,
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
      toast("User registered successfully! You have logged in!");

      const loginResp = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      if (loginResp.status === 200) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      toast("Error signing up");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="max-w-sm w-full space-y-6">
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
        <Select
          value={role}
          onValueChange={(val) => setRole(val as "manager" | "developer")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="developer">developer</SelectItem>
          </SelectContent>
        </Select>

        {role === "developer" && (
          <Select
            value={managerId?.toString()}
            onValueChange={(val) => setManagerId(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button className="gap-2 w-full" onClick={handleSignUp}>
          <User className="h-4 w-4" />
          Sign Up
        </Button>
      </div>
    </main>
  );
}
