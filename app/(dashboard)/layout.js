'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Compass, Trophy, FileText, User, LogOut, Menu, X, Bot, Sparkles } from 'lucide-react';
import { signOutUser } from '@/lib/auth';
import MentorDrawer from '@/components/MentorDrawer';

/**
 * Layout partagé pour le groupe de routes (dashboard).
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Feuille de route', href: '/roadmap', icon: Compass },
    { label: 'Progression', href: '/progression', icon: Trophy },
    { label: 'Notes & Write-ups', href: '/notes', icon: FileText },
    { label: 'Mon Profil', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex flex-col">
      {/* Navbar Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-cyber-card/90 backdrop-blur-md border-b border-gray-800/80 shadow-cyber-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-cyber-surface rounded-xl text-cyber-accent shadow-cyber-sm">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              CyberRoad <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-accent/10 text-cyber-accent font-semibold">V1</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyber-surface text-cyber-accent shadow-cyber-sm'
                      : 'text-gray-400 hover:text-white hover:bg-cyber-surface/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User actions & Mentor IA Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMentorOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20 hover:bg-cyber-accent/20 transition-all shadow-cyber-sm"
              title="Ouvrir le Mentor IA"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Mentor IA</span>
              <Sparkles className="w-3 h-3" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-cyber-surface min-h-[40px] min-w-[40px] flex items-center justify-center shadow-cyber-sm"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cyber-surface border-b border-gray-800/80 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-cyber-card text-cyber-accent shadow-cyber-sm'
                      : 'text-gray-300 hover:bg-cyber-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-gray-800/80 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMentorOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-cyber-accent bg-cyber-accent/10 hover:bg-cyber-accent/20 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Ouvrir le Mentor IA</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Volet Mentor IA global */}
      <MentorDrawer isOpen={mentorOpen} onClose={() => setMentorOpen(false)} />
    </div>
  );
}
