import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="w-full px-4 py-3 flex justify-between items-center border-b bg-background">
      {/* Logo */}
      <Link to="/">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          FeedForward
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-foreground"
            >
              Welcome, {user.full_name}
            </Link>

            {user.role === "manager" && (
              <Link to="/manage-users">
                <Button variant="outline" size="sm">
                  Manage Users
                </Button>
              </Link>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
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
        <ModeToggle />
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] p-4">
            <div className="flex flex-col gap-4 mt-6">
              {user ? (
                <>
                  <span className="text-sm font-medium text-foreground">
                    Welcome, {user.full_name}
                  </span>

                  {user.role === "manager" && (
                    <Link to="/manage-users">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Users
                      </Button>
                    </Link>
                  )}

                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <ModeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
