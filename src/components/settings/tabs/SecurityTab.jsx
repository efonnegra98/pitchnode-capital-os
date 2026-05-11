import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Shield, Monitor, Lock } from "lucide-react";

export default function SecurityTab({ user, toast }) {
  const loginMethod = user?.email ? "Email / Password" : "Google OAuth";

  const handleSignOutAll = () => {
    base44.auth.logout();
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Two-Factor Authentication</h2>
        <div className="flex items-center justify-between py-3 opacity-50 cursor-not-allowed">
          <div>
            <p className="text-sm font-medium text-foreground">Authenticator App</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium border border-border">Coming Soon</span>
            <div className="relative w-11 h-6 rounded-full bg-muted border border-border">
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Active Sessions</h2>
        <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border mb-5">
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
            <Monitor className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Current Device</p>
            <p className="text-xs text-muted-foreground mt-0.5">Browser session · Active now</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Active</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleSignOutAll}
        >
          Sign Out All Devices
        </Button>
      </div>

      {/* Login Method */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Login Method</h2>
        <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
            {loginMethod === "Google OAuth" ? (
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5836-5.036-3.7109H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
                <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
              </svg>
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{loginMethod}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}