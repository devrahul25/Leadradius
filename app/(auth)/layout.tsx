import { Radar, ShieldCheck, Sparkles, Database } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden border-l border-border bg-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/30 via-bg to-bg" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-cyan/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-glow">
              <Radar className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight">LeadRadius AI</span>
          </div>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-semibold tracking-tight leading-tight text-balance">
              Find <span className="gradient-text">premium local leads</span> within any radius — scored, ranked, ready.
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Sweet shops near Nathdwara. Salons across Udaipur. Wedding venues
              within 80km of Jaipur. Get the full set in seconds.
            </p>

            <div className="grid gap-4">
              <Feature icon={<Sparkles className="h-4 w-4 text-brand-300" />} title="AI lead scoring" desc="Quality buckets you can trust before you call." />
              <Feature icon={<Database className="h-4 w-4 text-accent-cyan" />} title="Google Places powered" desc="Live ratings, reviews, phone, hours, address." />
              <Feature icon={<ShieldCheck className="h-4 w-4 text-accent-emerald" />} title="Cost-aware" desc="Only fetches expensive details for high-quality leads." />
            </div>
          </div>

          <p className="text-xs text-text-muted">© LeadRadius AI · Built for sales teams that move fast.</p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-bg-card border border-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-muted">{desc}</p>
      </div>
    </div>
  );
}
