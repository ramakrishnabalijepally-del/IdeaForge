"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { href: "/explore", label: "Explore Ideas" },
  { href: "/search", label: "AI Search" },
  { href: "/generate", label: "AI Generator" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out.");
      setUserMenuOpen(false);
    } catch {
      toast.error("Logout failed.");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-text-primary">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>Idea<span className="text-amber-400">Forge</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth controls */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm text-text-secondary"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </div>
                <span className="hidden lg:block">{user.full_name || user.email.split("@")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-surface-DEFAULT border border-surface-border rounded-xl shadow-xl py-1 animate-fade-in">
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-400 hover:bg-surface-hover transition-colors">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-surface-border my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface-hover text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-background animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname.startsWith(link.href)
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-surface-border pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-violet-400 hover:bg-surface-hover">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-surface-hover">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
