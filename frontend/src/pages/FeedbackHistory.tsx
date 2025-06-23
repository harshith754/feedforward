"use client";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  History,
  Star,
  User as UserIcon,
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { User } from "@/types/user";

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
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    color: "bg-green-100 text-green-800",
    icon: TrendingUp,
    iconColor: "text-green-600",
  },
  neutral: {
    label: "Neutral",
    color: "bg-gray-100 text-gray-800",
    icon: Minus,
    iconColor: "text-gray-600",
  },
  negative: {
    label: "Negative",
    color: "bg-red-100 text-red-800",
    icon: TrendingDown,
    iconColor: "text-red-600",
  },
};

export default function FeedbackHistoryPage() {
  const { userId } = useParams<{ userId: string }>();
  const [targetUser, setTargetUser] = useState<Pick<
    User,
    "id" | "full_name"
  > | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedback: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
  });

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const [userRes, feedbackRes] = await Promise.all([
          axios.get(`/api/users/${userId}`),
          axios.get(`/api/feedback/history/${userId}`, {
            withCredentials: true,
          }),
        ]);

        setTargetUser({
          id: userRes.data.id,
          full_name: userRes.data.full_name,
        });

        setFeedbackList(feedbackRes.data);

        const feedback = feedbackRes.data;
        const totalFeedback = feedback.length;
        const averageRating =
          totalFeedback > 0
            ? feedback.reduce((sum: number, f: Feedback) => sum + f.rating, 0) /
              totalFeedback
            : 0;

        const sentimentBreakdown = feedback.reduce(
          (acc: any, f: Feedback) => {
            acc[f.overall_sentiment] = (acc[f.overall_sentiment] || 0) + 1;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );

        setStats({ averageRating, totalFeedback, sentimentBreakdown });
      } catch (err) {
        toast.error("Failed to load feedback history");
        setTargetUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-current text-amber-500"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="text-muted-foreground text-lg">
            Loading feedback history...
          </span>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">User not found</h3>
              <p className="text-muted-foreground">
                The user's feedback history could not be loaded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feedback History
          </h1>
          <p className="text-muted-foreground">
            All feedback received by {targetUser.full_name}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">/5</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Total Feedback
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">
                  {stats.totalFeedback}
                </span>
                <span className="text-muted-foreground"> reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Positive Feedback
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">
                  {stats.sentimentBreakdown.positive}
                </span>
                <span className="text-muted-foreground">
                  {stats.totalFeedback > 0 &&
                    ` (${Math.round(
                      (stats.sentimentBreakdown.positive /
                        stats.totalFeedback) *
                        100
                    )}%)`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Feedback Timeline</h2>
            <Badge variant="outline">{feedbackList.length} total</Badge>
          </div>

          {feedbackList.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No feedback yet</h3>
                  <p className="text-muted-foreground">
                    {targetUser.full_name} hasn't received any feedback yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => {
                const sentimentInfo =
                  sentimentConfig[feedback.overall_sentiment];
                const SentimentIcon = sentimentInfo.icon;
                const giverName = feedback.giver?.full_name || "Unknown";
                return (
                  <Card
                    key={feedback.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          From {giverName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={sentimentInfo.color}
                          >
                            <SentimentIcon
                              className={`h-3 w-3 mr-1 ${sentimentInfo.iconColor}`}
                            />
                            {sentimentInfo.label}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(feedback.created_at)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>{renderStars(feedback.rating)}</div>

                        <Separator />

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-1">
                              Strengths
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feedback.strengths}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-amber-700 mb-1">
                              Areas to Improve
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feedback.areas_to_improve}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
