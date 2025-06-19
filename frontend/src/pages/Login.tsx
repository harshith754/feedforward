import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function LoginPage() {
  const { openSignIn } = useClerk();

  const handleLogin = async () => {
    try {
      await openSignIn({ redirectUrl: "/dashboard" });
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to FeedForward</h1>
        <p className="text-muted-foreground">
          Structured, safe feedback between managers and employees.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => handleLogin()}
          >
            <User className="h-4 w-4" />
            Continue as Manager
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => handleLogin()}
          >
            <User className="h-4 w-4" />
            Continue as Employee
          </Button>
        </div>
      </div>
    </main>
  );
}
