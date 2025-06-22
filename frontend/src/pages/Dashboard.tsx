import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuth();
  const [manager, setManager] = useState<{ id: number; username: string } | null>(null);
  const [developers, setDevelopers] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        if (user.role === "developer") {
          const res = await axios.get(`/api/users/manager`, { withCredentials: true });
          setManager(res.data);
        } else if (user.role === "manager") {
          const res = await axios.get(`/api/users/developers`, { withCredentials: true });
          setDevelopers(res.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    }

    fetchData();
  }, [user]);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-12">
      <h1 className="text-3xl font-bold mb-6 text-primary">Dashboard</h1>

      {user?.role === "developer" && manager && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Your Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You are assigned to:</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {manager.username}
            </p>
          </CardContent>
        </Card>
      )}

      {user?.role === "manager" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Team</h2>
          {developers.length === 0 ? (
            <p className="text-muted-foreground">No developers assigned yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <Card key={dev.id}>
                  <CardHeader>
                    <CardTitle>{dev.username}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Developer ID: {dev.id}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Dashboard;
