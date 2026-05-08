"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("team@jaiveeru.co.in");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="lg:hidden flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-glow">
          <Radar className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold">LeadRadius AI</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-text-secondary">Sign in to continue building your lead pipeline.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>

        <div>
          <Label
            htmlFor="password"
            hint={
              <Link href="/forgot" className="text-brand-300 hover:text-brand-200">
                Forgot?
              </Link>
            }
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-bg px-2 text-text-muted">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" type="button">Google</Button>
          <Button variant="secondary" type="button">SSO</Button>
        </div>
      </form>

      <p className="text-center text-sm text-text-secondary">
        New here?{" "}
        <Link href="/register" className="text-brand-300 hover:text-brand-200 font-medium">
          Create an account
        </Link>
      </p>

      <div className="rounded-lg border border-border bg-bg-surface/40 p-3 text-xs text-text-muted">
        <strong className="text-text-secondary">Demo:</strong> any email + password works. Use{" "}
        <code className="text-brand-300">admin@leadradius.io</code> for admin role.
      </div>
    </div>
  );
}
