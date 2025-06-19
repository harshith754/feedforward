import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full px-0 py-3 sm:px-6 flex justify-between items-center border-b bg-background">
      {/* Logo */}
      <Link to="/">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">FeedForward</h1>
      </Link>

      <div className="flex items-center gap-4">
        <ModeToggle />

        {user ? (
          <>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                Welcome, {user.username}!
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
