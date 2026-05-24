import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Droplets, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { slugify } from "@/lib/utils";

interface NavbarProps {
  // propUser removed as we use AuthContext now
}

export function Navbar({}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, userType } = useAuth();
  const location = useLocation();

  const displayName = user?.full_name || user?.name || "Utilisateur";
  const hospitalPath = user?.name ? `/Donsang/${slugify(user.name)}` : "/hospital";
  const patientPath = user?.full_name ? `/Donsang/Mon-dossier/${slugify(user.full_name)}` : "/login";

  // Compute dynamic nav items based on login status and role
  const activeNavItems = (() => {
    const items = [
      { label: "Accueil", path: "/" },
      { label: "Alertes urgentes", path: "/UrgentAlerts" },
      { label: "Contact", path: "/contact" },
    ];

    if (isAuthenticated) {
      if (userType === "hospital") {
        // Hospital is the Admin dashboard
        items.push({ label: "Dashboard Admin", path: hospitalPath });
      } else if (userType === "admin") {
        items.push({ label: "Dashboard Admin", path: "/admin" });
      } else if (userType === "patient") {
        items.push({ label: "Mon dossier", path: patientPath });
      }
    }

    return items;
  })();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-18 md:h-16 flex items-stretch border-b border-slate-100 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center px-6 md:px-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo_sang.png" alt="Donsang Logo" className="h-10 md:h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* Center: Nav Links (absolutely centered) */}
      <div className="hidden lg:flex absolute inset-0 items-center justify-center gap-10 pointer-events-none">
        {activeNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`pointer-events-auto text-sm md:text-base font-bold transition-all ${
              location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Spacer to push right section */}
      <div className="flex-1" />

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
        {/* The Slant Background */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#780101] via-[#9f0101] to-[#c60505]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        {/* Sign In Button */}
        <div className="absolute inset-0 flex items-center justify-center pl-10">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 text-white">
              <Link to={userType === "hospital" ? hospitalPath : (userType === "admin" ? "/admin" : patientPath)} className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity cursor-pointer">
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
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu (Overlay Card) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-white/98 backdrop-blur-md z-[100] border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl animate-reveal max-h-[calc(100vh-72px)] overflow-y-auto">
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
              {/* User Profile Card */}
              <Link 
                to={userType === "hospital" ? hospitalPath : (userType === "admin" ? "/admin" : patientPath)} 
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white flex items-center justify-center text-sm font-black shadow-md">
                  {displayName.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm text-slate-900 leading-tight">{displayName}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {userType === "hospital" ? "Hôpital" : (userType === "admin" ? "Administrateur" : "Donneur")}
                  </span>
                </div>
              </Link>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                className="w-full rounded-2xl h-11 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          ) : (
            /* Login Button */
            <Link to="/login" className="w-full" onClick={() => setMobileOpen(false)}>
              <Button className="w-full rounded-2xl h-11 text-sm font-bold bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
