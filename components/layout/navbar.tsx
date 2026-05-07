"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search as SearchIcon, Sun, Moon, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadSession, clearSession, type AuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setSession(loadSession() ?? {
      email: "team@jaiveeru.co.in",
      name: "JV Team",
      token: "demo",
      role: "user",
    });
  }, []);

  const initials = session?.name
    ?.split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 lg:px-8 border-b border-border bg-bg-surface/60 backdrop-blur-xl">
      <div className="flex-1 max-w-xl">
        <Input
          placeholder="Search leads, cities, categories…"
          leftIcon={<SearchIcon className="h-4 w-4" />}
          rightSlot={
            <kbd className="hidden md:inline-flex items-center text-[10px] text-text-muted bg-bg-elevated border border-border rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          }
        />
      </div>

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Theme is locked to dark in the prototype">
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent-rose" />
      </Button>

      <div className="flex items-center gap-3 pl-3 border-l border-border">
        <div className="hidden md:flex flex-col leading-tight items-end">
          <span className="text-sm text-text-primary font-medium">{session?.name}</span>
          <span className="text-[11px] text-text-muted">{session?.email}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
