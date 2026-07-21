"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName);
      toast.success("Welcome to IdeaForge!");
      router.push("/explore");
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-xl text-text-primary mb-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Idea<span className="text-amber-400">Forge</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Create your account</h1>
          <p className="text-sm text-text-secondary mt-1">Start discovering and generating ideas</p>
        </div>

        <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-6">
          {errors.form && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errors.form}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="fullName" label="Full name" value={form.fullName} onChange={set("fullName")}
              placeholder="Jane Doe" error={errors.fullName} icon={<User className="w-4 h-4" />} />
            <Input id="email" type="email" label="Email address" value={form.email} onChange={set("email")}
              placeholder="you@example.com" error={errors.email} icon={<Mail className="w-4 h-4" />} />
            <Input id="password" type="password" label="Password" value={form.password} onChange={set("password")}
              placeholder="At least 8 characters" error={errors.password} icon={<Lock className="w-4 h-4" />} />
            <Input id="confirm" type="password" label="Confirm password" value={form.confirm} onChange={set("confirm")}
              placeholder="Repeat your password" error={errors.confirm} icon={<Lock className="w-4 h-4" />} />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
