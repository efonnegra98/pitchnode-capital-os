import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";

export default function AccessRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company: "",
    reason: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send email notification to admin
    await base44.integrations.Core.SendEmail({
      to: "admin@example.com", // Replace with actual admin email
      subject: `Access Request - ${form.full_name}`,
      body: `
New access request received:

Name: ${form.full_name}
Email: ${form.email}
Company: ${form.company}
Reason: ${form.reason}
      `.trim()
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted</h2>
          <p className="text-slate-600 mb-8">
            We've received your access request. Our team will review it and get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Gateway")}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to home
              </Button>
            </Link>
            <Link to={createPageUrl("Gateway")}>
              <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                Try Again
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl("Gateway")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Request Access</h1>
          </div>
          
          <p className="text-slate-600">
            Submit your information and we'll review your request for access to PitchNode Capital OS.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div>
            <Label className="text-slate-700 font-medium">Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1.5 h-11 bg-white"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label className="text-slate-700 font-medium">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 h-11 bg-white"
              placeholder="founder@company.com"
              required
            />
          </div>

          <div>
            <Label className="text-slate-700 font-medium">Company</Label>
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="mt-1.5 h-11 bg-white"
              placeholder="Your company name"
              required
            />
          </div>

          <div>
            <Label className="text-slate-700 font-medium">Why do you need access?</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="mt-1.5 h-24 bg-white"
              placeholder="Tell us about your fundraising plans..."
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            Submit Request
          </Button>
        </form>
      </div>
    </div>
  );
}