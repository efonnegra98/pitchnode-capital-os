import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Sun, Moon, Monitor, Mail, CheckCircle } from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-foreground mb-5">{children}</h2>;
}

export default function ProfileTab({ user, profile, theme, setTheme, toast }) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      await base44.integrations.Core.UploadFile({ file });
      toast({ title: "Photo updated", description: "Your profile photo has been updated." });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await base44.auth.sendPasswordResetEmail(user.email);
      setResetSent(true);
      toast({ title: "Reset email sent", description: "Check your inbox for a password reset link." });
    } catch {
      toast({ title: "Could not send reset email", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <SectionTitle>Personal Information</SectionTitle>
        <div className="flex items-start gap-5 mb-6 pb-6 border-b border-border">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-violet-700 font-bold text-xl">
              {initials}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
              <Upload className="w-3 h-3 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{user?.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            {photoUploading && <p className="text-xs text-violet-600 mt-1">Uploading…</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={user?.full_name || ""} readOnly className="mt-1.5 bg-muted cursor-default text-muted-foreground" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input value={user?.email || ""} readOnly className="mt-1.5 bg-muted cursor-default text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Managed via Google or email login
            </p>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <SectionTitle>Password</SectionTitle>
        <p className="text-sm text-muted-foreground mb-4">
          We'll send a password reset link to your email address.
        </p>
        {resetSent ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" /> Reset email sent — check your inbox.
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            disabled={resetLoading}
          >
            {resetLoading ? "Sending…" : "Change Password"}
          </Button>
        )}
      </Card>

      {/* Active Sessions */}
      <Card>
        <SectionTitle>Active Sessions</SectionTitle>
        <div className="flex items-center justify-between py-3 border border-border rounded-xl px-4 mb-4">
          <div>
            <p className="text-sm font-medium text-foreground">Current Device</p>
            <p className="text-xs text-muted-foreground mt-0.5">Browser session · Active now</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Active</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => base44.auth.logout()}
        >
          Sign Out All Devices
        </Button>
      </Card>

      {/* Appearance */}
      <Card>
        <SectionTitle>Appearance</SectionTitle>
        <p className="text-sm text-muted-foreground mb-4">Choose how Capital OS looks on your device.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", icon: Sun, label: "Light" },
            { value: "dark",  icon: Moon, label: "Dark" },
            { value: "system", icon: Monitor, label: "System" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              data-no-touch-target
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === value
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                  : "border-border bg-background hover:border-violet-300 hover:bg-accent"
              }`}
            >
              <Icon className={`w-5 h-5 ${theme === value ? "text-violet-600" : "text-muted-foreground"}`} />
              <p className={`text-xs font-semibold ${theme === value ? "text-violet-700 dark:text-violet-400" : "text-foreground"}`}>{label}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}