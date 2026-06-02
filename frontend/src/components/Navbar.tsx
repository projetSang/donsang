import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronRight, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { slugify } from "@/lib/utils";
import type { Lang } from "@/i18n/translations";

interface NavbarProps {}

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇲🇦" },
];

export function Navbar({}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { user, isAuthenticated, logout, userType } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  const displayName = user?.full_name || user?.name || t.nav.signIn;
  const hospitalPath = user?.name ? `/Donsang/${slugify(user.name)}` : "/hospital";
  const donorPath = user?.full_name ? `/Donsang/Donneur/${slugify(user.full_name)}` : "/login";

  const activeNavItems = (() => {
    const items = [
      { label: t.nav.home, path: "/" },
      { label: t.nav.urgentAlerts, path: "/UrgentAlerts" },
      { label: t.nav.donationCenters, path: "/centres-don" },
      { label: t.nav.contact, path: "/contact" },
    ];

    if (isAuthenticated) {
      if (userType === "hospital") {
        items.push({ label: t.nav.adminDashboard, path: hospitalPath });
      } else if (userType === "admin") {
        items.push({ label: t.nav.adminDashboard, path: "/admin" });
      } else if (userType === "donor") {
        items.push({ label: t.nav.myFile, path: donorPath });
      }
    }

    return items;
  })();

  const currentLang = LANGS.find((l) => l.code === lang)!;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-18 md:h-16 flex items-stretch border-b border-slate-100 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center px-6 md:px-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo_sang.png" alt="Donsang Logo" className="h-10 md:h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* Center: Nav Links */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-7 xl:gap-9">
        {activeNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-sm md:text-base font-bold transition-all whitespace-nowrap ${
              location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Language switcher - Desktop */}
      <div className="hidden lg:flex items-center px-6 relative">
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all text-sm font-bold text-slate-600"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span>{currentLang.label}</span>
        </button>

        {langOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 min-w-[100px]">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setLangOpen(false); }}
                className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold transition-colors hover:bg-slate-50 ${
                  lang === l.code ? "text-primary bg-primary/5" : "text-slate-600"
                }`}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile toggle */}
      <div className="flex lg:hidden items-center pr-6">
        <button
          className="text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-7 w-7 text-primary" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Right Section (Slanted Gradient) - Desktop only */}
      <div className="hidden lg:block relative w-[200px] xl:w-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#780101] via-[#9f0101] to-[#c60505] [clip-path:polygon(15%_0,100%_0,100%_100%,0%_100%)]" />
        <div className="absolute inset-0 flex items-center justify-center pl-10">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 text-white">
              <Link
                to={userType === "hospital" ? hospitalPath : userType === "admin" ? "/admin" : donorPath}
                className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="text-sm font-bold hidden xl:block truncate max-w-[120px]">{displayName}</span>
                <div className="h-8 w-8 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black shadow-lg">
                  {displayName.charAt(0).toUpperCase() ?? "?"}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 transition-colors"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-5 h-9 font-black text-sm shadow-2xl transition-all hover:scale-105">
                {t.nav.signIn}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-white/98 backdrop-blur-md z-[100] border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl animate-reveal max-h-[calc(100vh-72px)] overflow-y-auto">
          {/* Language switcher mobile */}
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border text-sm font-bold transition-all ${
                  lang === l.code
                    ? "border-primary text-primary bg-primary/5"
                    : "border-slate-200 text-slate-500 hover:border-primary/40"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Menu Items */}
          <div className="flex flex-col gap-2 w-full">
            {activeNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  location.pathname === item.path
                    ? "bg-primary/5 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-4 w-full">
              <Link
                to={userType === "hospital" ? hospitalPath : userType === "admin" ? "/admin" : donorPath}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white flex items-center justify-center text-sm font-black shadow-md">
                  {displayName.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm text-slate-900 leading-tight">{displayName}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {userType === "hospital" ? t.nav.hospital : userType === "admin" ? t.nav.administrator : t.nav.donor}
                  </span>
                </div>
              </Link>
              <Button
                variant="outline"
                className="w-full rounded-2xl h-11 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors flex items-center justify-center gap-2"
                onClick={() => { setMobileOpen(false); logout(); }}
              >
                <LogOut className="h-4 w-4" />
                {t.nav.signOut}
              </Button>
            </div>
          ) : (
            <Link to="/login" className="w-full" onClick={() => setMobileOpen(false)}>
              <Button className="w-full rounded-2xl h-11 text-sm font-bold bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2">
                {t.nav.signIn}
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
