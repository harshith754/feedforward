"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users2, Building } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const Navbar: React.FC = () => {
  return (
    <header className="w-full px-0 py-3 sm:px-6 flex justify-between items-center border-b bg-background">
      {/* Logo */}
      <Link to="/">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">FeedForward</h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-4">
        <ModeToggle />

        <SignedIn>
          <Link to="/manage-users">
            <Button variant="ghost" size="sm" className="gap-2 text-foreground">
              <Users2 className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>

          <Link to="/manage-organizations">
            <Button variant="ghost" size="sm" className="gap-2 text-foreground">
              <Building className="h-4 w-4" />
              Manage Organizations
            </Button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <Button variant="outline" size="sm" className="gap-2 text-foreground">
              Login
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full ring-1 ring-border",
                userButtonPopoverCard: "bg-popover border-border",
                userButtonPopoverActionButton:
                  "text-muted-foreground hover:bg-muted",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
