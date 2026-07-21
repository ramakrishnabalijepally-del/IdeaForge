"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-xl text-text-primary mb-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Idea<span className="text-amber-400">Forge</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
        </div>

        <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-6">
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email" type="email" label="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              id="password" type="password" label="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" required
              icon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300 transition-colors">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
