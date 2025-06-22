import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  manager?: { id: number; username: string; full_name: string } | null;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const userResp = await axios.get("/api/users/all", {
        withCredentials: true,
      });
      const managerResp = await axios.get("/api/users/managers", {
        withCredentials: true,
      });
    
      setUsers(userResp.data);
      setManagers(managerResp.data);
    } catch (err) {
      console.error(err);
      toast("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(userId: number, managerId: number) {
    try {
      await axios.put(
        `/api/users/${userId}/change-manager/${managerId}`,
        {},
        { withCredentials: true }
      );
      toast("Manager reassigned successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast("Failed to reassign manager");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-12">
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Users</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="text-lg">{user.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Role: <span className="capitalize">{user.role}</span>
                </p>

                {user.role === "developer" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Current Manager:{" "}
                      <span className="font-medium text-foreground">
                        {user.manager?.full_name || "None"}
                      </span>
                    </p>
                    <Select
                      onValueChange={(val) =>
                        handleAssign(user.id, parseInt(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Reassign Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
