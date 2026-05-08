"use client";

import { useEffect, useState } from "react";
import { Save, Settings2, Key, Globe, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [useLivePlaces, setUseLivePlaces] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await api.get<any>("/settings");
        setGoogleApiKey(data.googleApiKey || "");
        setUseLivePlaces(data.useLivePlaces || false);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.post("/settings", { googleApiKey, useLivePlaces });
      setMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Configuration</p>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your API keys, preferences, and account configuration.
        </p>
      </div>

      <div className="glass p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Settings2 className="h-5 w-5 text-brand-300" />
          <h2 className="text-lg font-medium text-text-primary">Google Places Integration</h2>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-bg-surface/50 rounded-lg w-full" />
            <div className="h-10 bg-bg-surface/50 rounded-lg w-full" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="googleApiKey">Google Places API Key</Label>
                <Input
                  id="googleApiKey"
                  type="password"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  leftIcon={<Key className="h-4 w-4" />}
                  placeholder="AIzaSy..."
                />
                <p className="text-xs text-text-muted mt-2">
                  This key is stored securely and used server-side to fetch live data from Google Maps.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-bg-surface/40 p-4">
                <Switch
                  checked={useLivePlaces}
                  onChange={setUseLivePlaces}
                  label="Enable Live API Calls"
                  description="When disabled, searches will return simulated mock data (useful for testing)."
                />
                <Globe className="h-4 w-4 text-text-muted" />
              </div>
            </div>

            {message && (
              <div className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${message.type === "error" ? "border-accent-rose/30 bg-accent-rose/10 text-accent-rose" : "border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald"}`}>
                {message.type === "error" && <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />}
                <p>{message.text}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" />
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
