"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MessageSquare, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="font-bold inline-block">AI Chat</span>
          </Link>
          {user && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/chat"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/chat" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Chat
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname?.startsWith("/dashboard")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}