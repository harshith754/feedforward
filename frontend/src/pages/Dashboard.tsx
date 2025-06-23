import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { UserRole } from "@/types/user";
import {
  Star,
  Users,
  User as UserIcon,
  MessageSquarePlus,
  History,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Feedback {
  id: number;
  giver: {
    id: number;
    full_name: string;
  };
  strengths: string;
  areas_to_improve: string;
  overall_sentiment: "positive" | "neutral" | "negative";
  rating: number;
  created_at: string;
  is_acknowledged: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [manager, setManager] = useState<User | null>(null);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [tab, setTab] = useState<string>("unacknowledged");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        if (user.role === UserRole.DEVELOPER) {
          const [managerRes, feedbackRes] = await Promise.all([
            axios.get(`/api/users/manager`, { withCredentials: true }),
            axios.get(`/api/feedback/received`, { withCredentials: true }),
          ]);
          setManager(managerRes.data.manager);
          setFeedbackList(feedbackRes.data);
        } else if (user.role === UserRole.MANAGER) {
          const [teamRes, feedbackRes] = await Promise.all([
            axios.get(`/api/users/team`, { withCredentials: true }),
            axios.get(`/api/feedback/received`, { withCredentials: true }),
          ]);
          setDevelopers(teamRes.data);
          setFeedbackList(feedbackRes.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setFeedbackLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleAcknowledge = async (feedbackId: number) => {
    try {
      await axios.post(
        `/api/feedback/acknowledge`,
        { feedback_id: feedbackId },
        { withCredentials: true }
      );
      setFeedbackList((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, is_acknowledged: true } : f
        )
      );
      toast("Feedback acknowledged!");
    } catch (err) {
      toast("Failed to acknowledge feedback");
    }
  };

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "negative":
        return (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge variant="default">Positive</Badge>;
      case "negative":
        return <Badge variant="destructive">Needs Improvement</Badge>;
      default:
        return <Badge variant="secondary">Neutral</Badge>;
    }
  };

  const renderFeedbackList = (acknowledged: boolean) => {
    const filtered = feedbackList.filter(
      (f) => f.is_acknowledged === acknowledged
    );

    if (filtered.length === 0) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              {acknowledged ? (
                <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground" />
              ) : (
                <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
              )}
              <p className="text-muted-foreground">
                No feedback {acknowledged ? "acknowledged" : "to acknowledge"}.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <Card key={f.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  {f.giver?.full_name || "Anonymous"}
                </CardTitle>
                {acknowledged && (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(f.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  <span className="font-medium">{f.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(f.overall_sentiment)}
                  {getSentimentBadge(f.overall_sentiment)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      Strengths
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.strengths}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      Areas to Improve
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {f.areas_to_improve}
                  </p>
                </div>
              </div>

              {!acknowledged && (
                <Button
                  size="sm"
                  onClick={() => handleAcknowledge(f.id)}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (feedbackLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="text-muted-foreground text-lg">
            Loading dashboard...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name}
          </p>
        </div>

        {user?.role === UserRole.DEVELOPER && manager && (
          <div className="flex flex-col gap-4">
            <div>
              <Card className="max-w-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Your Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Assigned to
                      </p>
                      <p className="text-lg font-semibold">
                        {manager.full_name}
                      </p>
                    </div>
                    {renderRating(manager.rating)}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          (window.location.href = `/feedback/create/${manager.id}`)
                        }
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        Give Feedback
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquarePlus className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Feedback Received</h2>
              </div>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList>
                  <TabsTrigger
                    value="unacknowledged"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="acknowledged"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Acknowledged
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="unacknowledged" className="mt-4">
                  {feedbackLoading ? (
                    <div className="text-center py-8">Loading feedback...</div>
                  ) : (
                    renderFeedbackList(false)
                  )}
                </TabsContent>
                <TabsContent value="acknowledged" className="mt-4">
                  {feedbackLoading ? (
                    <div className="text-center py-8">Loading feedback...</div>
                  ) : (
                    renderFeedbackList(true)
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {user?.role === UserRole.MANAGER && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Your Team</h2>
                <Badge variant="outline">{developers.length}</Badge>
              </div>

              {developers.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No developers assigned yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {developers.map((dev) => (
                    <Card
                      key={dev.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          {dev.full_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {renderRating(dev.rating)}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                (window.location.href = `/feedback/create/${dev.id}`)
                              }
                            >
                              <MessageSquarePlus className="h-4 w-4 mr-2" />
                              Give Feedback
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Feedback Received</h2>
              </div>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList>
                  <TabsTrigger
                    value="unacknowledged"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="acknowledged"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Acknowledged
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="unacknowledged" className="mt-4">
                  {feedbackLoading ? (
                    <div className="text-center py-8">Loading feedback...</div>
                  ) : (
                    renderFeedbackList(false)
                  )}
                </TabsContent>
                <TabsContent value="acknowledged" className="mt-4">
                  {feedbackLoading ? (
                    <div className="text-center py-8">Loading feedback...</div>
                  ) : (
                    renderFeedbackList(true)
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
