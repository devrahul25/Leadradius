"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Database,
  Download,
  Activity,
  Settings,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search Leads", icon: Search },
  { href: "/leads", label: "Saved Leads", icon: Database },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/usage", label: "API Usage", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-bg-surface/40 backdrop-blur-xl">
      <div className="px-6 h-16 flex items-center gap-2.5 border-b border-border">
        <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-glow">
          <Radar className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-text-primary">LeadRadius</span>
          <span className="text-[10px] text-text-muted uppercase tracking-widest">AI Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 scroll-thin overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const disabled = !!item.badge;
          const inner = (
            <>
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-300" : "text-text-muted")} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] uppercase tracking-wider text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </>
          );
          const className = cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            active
              ? "bg-brand-600/10 text-text-primary border border-brand-500/20"
              : "text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent",
            disabled && "opacity-60 cursor-not-allowed pointer-events-none"
          );
          return disabled ? (
            <div key={item.href} className={className}>{inner}</div>
          ) : (
            <Link key={item.href} href={item.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="glass p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">API credits</span>
            <span className="text-text-primary font-medium">8,420</span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan" style={{ width: "62%" }} />
          </div>
          <p className="text-text-muted">Resets May 31</p>
        </div>
      </div>
    </aside>
  );
}
