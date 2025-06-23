import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MessageSquarePlus, Star, User as UserIcon } from "lucide-react";
import type { User } from "@/types/user";

const sentimentOptions = [
  {
    value: "positive",
    label: "Positive",
    color: "bg-green-100 text-green-800",
  },
  { value: "neutral", label: "Neutral", color: "bg-gray-100 text-gray-800" },
  { value: "negative", label: "Negative", color: "bg-red-100 text-red-800" },
];

export default function CreateFeedbackForm() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState<Pick<
    User,
    "id" | "full_name"
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] = useState("");
  const [overallSentiment, setOverallSentiment] = useState("positive");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setTargetUser({ id: res.data.id, full_name: res.data.full_name });
      } catch (err) {
        setTargetUser(null);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    setSubmitting(true);
    try {
      await axios.post(
        "/api/feedback/create",
        {
          target_user_id: targetUser.id,
          strengths,
          areas_to_improve: areasToImprove,
          overall_sentiment: overallSentiment,
          rating: Number(rating),
        },
        { withCredentials: true }
      );

      toast.success(
        `Feedback submitted successfully for ${targetUser.full_name}`
      );

      // Reset form
      setStrengths("");
      setAreasToImprove("");
      setOverallSentiment("positive");
      setRating(5);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="text-muted-foreground text-lg">Loading...</span>
        </div>
      </main>
    );
  }

  if (!targetUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">User not found</h3>
              <p className="text-muted-foreground">
                The user you're trying to give feedback to could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSentiment = sentimentOptions.find(
    (opt) => opt.value === overallSentiment
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Give Feedback</h1>
          <p className="text-muted-foreground">
            Share constructive feedback to help your colleague grow
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              Feedback for {targetUser.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  placeholder="What does this person do well? Highlight their key strengths..."
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Focus on specific examples and positive contributions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="areas-to-improve">Areas to Improve</Label>
                <Textarea
                  id="areas-to-improve"
                  placeholder="What areas could benefit from development? Provide constructive suggestions..."
                  value={areasToImprove}
                  onChange={(e) => setAreasToImprove(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be specific and offer actionable suggestions for improvement
                </p>
              </div>

              <div className="space-y-2">
                <Label>Overall Sentiment</Label>
                <Select
                  value={overallSentiment}
                  onValueChange={setOverallSentiment}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={selectedSentiment?.color}
                        >
                          {selectedSentiment?.label}
                        </Badge>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sentimentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={option.color}>
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="rating">Rating</Label>
                <div className="space-y-2">
                  <Input
                    id="rating"
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    min={1}
                    max={5}
                    className="w-24"
                    required
                  />
                  {renderStars(rating)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate overall performance from 1 (needs improvement) to 5
                  (excellent)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  submitting || !strengths.trim() || !areasToImprove.trim()
                }
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>

              {(!strengths.trim() || !areasToImprove.trim()) && (
                <p className="text-xs text-muted-foreground text-center">
                  Please fill in both strengths and areas to improve to submit
                  feedback
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
