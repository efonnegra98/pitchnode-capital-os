import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["General Question", "Bug Report", "Billing Issue", "Feature Request"];

export default function SupportTab({ user, toast }) {
  const [form, setForm] = useState({
    category: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSend = async () => {
    if (!form.category || !form.subject.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "christian@pitchnode.com",
        subject: `[Support] ${form.category}: ${form.subject}`,
        body: `From: ${user?.full_name || "Unknown"} (${user?.email || "no email"})\nCategory: ${form.category}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
      });
      setSent(true);
      setForm({ category: "", subject: "", message: "" });
      toast({ title: "Message sent!", description: "We'll get back to you within 1 business day." });
    } catch (err) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Form */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-1">Contact Support</h2>
        <p className="text-sm text-muted-foreground mb-6">We typically respond within 1 business day.</p>

        {sent ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-semibold text-foreground mb-1">Message Sent!</p>
            <p className="text-sm text-muted-foreground">We'll get back to you at {user?.email} within 1 business day.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-violet-600 hover:text-violet-500 font-medium"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={e => set("subject", e.target.value)}
                className="mt-1.5"
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={e => set("message", e.target.value)}
                className="mt-1.5 min-h-[120px]"
                placeholder="Describe your issue or question in detail…"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground">Other Ways to Reach Us</h2>

        <div className="flex items-center gap-3 py-3 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Email</p>
            <a href="mailto:christian@pitchnode.com" className="text-sm font-medium text-violet-600 hover:text-violet-500">
              christian@pitchnode.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 py-3 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Response Time</p>
            <p className="text-sm text-foreground">Within 1 business day</p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="text-sm text-violet-600 hover:text-violet-500 font-medium">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/privacy" className="text-sm text-violet-600 hover:text-violet-500 font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}