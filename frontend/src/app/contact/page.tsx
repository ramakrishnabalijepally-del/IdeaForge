"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success("Message sent! We'll be in touch.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary mb-2">Message sent!</h2>
        <p className="text-text-secondary">We'll get back to you within 48 hours.</p>
        <button onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
          className="mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-text-primary mb-1">Get in Touch</h1>
        <p className="text-text-secondary text-sm">Have questions, feedback, or partnership ideas? We'd love to hear from you.</p>
      </div>

      <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Your name" value={form.name} onChange={set("name")}
            placeholder="Jane Doe" required icon={<MessageSquare className="w-4 h-4" />} />
          <Input id="email" type="email" label="Email address" value={form.email} onChange={set("email")}
            placeholder="jane@example.com" required icon={<Mail className="w-4 h-4" />} />
          <Textarea id="message" label="Message" value={form.message} onChange={set("message")}
            placeholder="Tell us what's on your mind…" rows={5} required />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            <Send className="w-4 h-4" /> Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
