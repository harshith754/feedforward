// pages/dashboard.tsx or wherever this lives
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { UserRole } from "@/types/user";
import { Star, Users, User as UserIcon, MessageSquarePlus, History } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [manager, setManager] = useState<User | null>(null);
  const [developers, setDevelopers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        if (user.role === UserRole.DEVELOPER) {
          const res = await axios.get(`/api/users/manager`, {
            withCredentials: true,
          });
          setManager(res.data.manager);
        } else if (user.role === UserRole.MANAGER) {
          const res = await axios.get(`/api/users/team`, {
            withCredentials: true,
          });
          setDevelopers(res.data);
          console.log("Developers:", res.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    }

    fetchData();
  }, [user]);

  const renderRating = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return null;
    
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-amber-500" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Rating
        </Badge>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name}
          </p>
        </div>

        {user?.role === UserRole.DEVELOPER && manager && (
          <div className="max-w-md">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Your Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned to</p>
                    <p className="text-lg font-semibold">{manager.full_name}</p>
                  </div>
                  {renderRating(manager.rating)}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      Give Feedback
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user?.role === UserRole.MANAGER && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Your Team</h2>
              <Badge variant="outline">{developers.length}</Badge>
            </div>
            
            {developers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No developers assigned yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {developers.map((dev) => (
                  <Card key={dev.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{dev.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {renderRating(dev.rating)}
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <MessageSquarePlus className="h-4 w-4 mr-2" />
                            Give Feedback
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <History className="h-4 w-4 mr-2" />
                            History
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;