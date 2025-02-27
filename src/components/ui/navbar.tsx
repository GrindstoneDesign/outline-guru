import { Link, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { SignInDialog } from "../auth/SignInDialog";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleContentBriefClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowSignInDialog(true);
      return;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
              SERPBriefs
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/features"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              to="/competitor-analysis"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={handleContentBriefClick}
            >
              Competitor Analysis
            </Link>
            <Link
              to="/reviews"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Review Scraper
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata.avatar_url} 
                        alt={user.user_metadata.full_name} 
                      />
                      <AvatarFallback>
                        {user.user_metadata.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="font-medium">
                    <Link to="/app" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-medium">
                    <Link to="/account" className="w-full">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="font-medium">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
