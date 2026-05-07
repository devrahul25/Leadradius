"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { mockLogin, saveSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    saveSession({ ...mockLogin(email, password), name: name || mockLogin(email, password).name });
    router.push("/dashboard");
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
        <h1 className="text-3xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="text-text-secondary">Start finding qualified leads in under a minute.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Jaiveeru Sharma"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" hint="8+ characters">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            placeholder="Choose a strong password"
            minLength={8}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-text-muted text-center">
          By creating an account you agree to our terms of service and privacy policy.
        </p>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-300 hover:text-brand-200 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
