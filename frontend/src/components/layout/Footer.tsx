import Link from "next/link";
import { Lightbulb } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-background-secondary mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-text-primary mb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Idea<span className="text-amber-400">Forge</span></span>
            </div>
            <p className="text-sm text-text-secondary">
              AI-powered startup and manufacturing idea discovery platform for aspiring entrepreneurs.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/explore" className="hover:text-amber-400 transition-colors">Browse Ideas</Link></li>
              <li><Link href="/generate" className="hover:text-amber-400 transition-colors">AI Generator</Link></li>
              <li><Link href="/search" className="hover:text-amber-400 transition-colors">AI Search</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-border mt-8 pt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} IdeaForge. Built with Next.js, FastAPI & Gemini AI.
        </div>
      </div>
    </footer>
  );
}
