import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Droplets, LogOut } from "lucide-react";
interface NavbarProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

const navItems = [
  { label: "Accueil", path: "/" },
  { label: "Patient", path: "/patient" },
  { label: "Contact", path: "/contact" },
];

export function Navbar({ user: propUser }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(propUser || null);
  const location = useLocation();

  useEffect(() => {
    if (!propUser) {
      const storedData = localStorage.getItem("userData");
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      if (isAuthenticated && storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setUser({
            name: parsed.full_name || parsed.name || "Utilisateur",
            avatar: parsed.avatar
          });
        } catch (e) {
          console.error("Error parsing user data in Navbar", e);
        }
      }
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-18 md:h-16 flex items-stretch border-b border-slate-100 shadow-sm overflow-hidden">
      {/* Left: Logo */}
      <div className="flex items-center px-6 md:px-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="logo_sang.png" alt="" width={130} height={130} />
        </Link>
      </div>

      {/* Center: Nav Links (absolutely centered) */}
      <div className="hidden lg:flex absolute inset-0 items-center justify-center gap-10 pointer-events-none">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`pointer-events-auto text-sm md:text-base font-bold transition-all ${location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
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
        <button className="text-slate-900 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </div>

      {/* Right Section (Slanted Gradient) - Desktop only */}
      <div className="hidden sm:block relative w-[200px] xl:w-[300px]">
        {/* The Slant Background */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#780101] via-[#9f0101] to-[#c60505]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        {/* Sign In Button */}
        <div className="absolute inset-0 flex items-center justify-center pl-10">
          {user ? (
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm font-bold hidden sm:block">{user.name}</span>
              <div className="h-8 w-8 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black shadow-lg">
                {user.name?.charAt(0) ?? "?"}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-4 h-9 font-black text-md shadow-2xl transition-all hover:scale-105">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu (Overlay) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-[100] p-6 space-y-6 flex flex-col items-center text-center animate-reveal">
          <div className="space-y-2 w-full">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={` font-black text-sm md:text-slate-900 py-2 border-b border-slate-500font-bold transition-all ${location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
                <hr />
              </Link>
            ))}
          </div>
          {user ? (
            <div className="flex flex-col items-center gap-4 w-full pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full hero-gradient text-white flex items-center justify-center text-lg font-bold">
                  {user.name?.charAt(0) ?? "?"}
                </div>
                <span className="font-bold text-slate-900">{user.name}</span>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 text-lg text-primary border-primary"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Se déconnecter
              </Button>
            </div>
          ) : (
            <Link to="/login" className="w-full pt-6" onClick={() => setMobileOpen(false)}>
              <Button size="xl" className="w-full rounded-xl h-12 text-xl">Se connecter</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
