import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Droplets } from "lucide-react";

const navItems = [
  { label: "Accueil", path: "/" },
  { label: "Fonctionnalités", path: "/fonctionnalites" },
  { label: "Comment ça marche", path: "/comment-ca-marche" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-18 md:h-16 flex items-stretch border-b border-slate-100 shadow-sm overflow-hidden">
      {/* Left Section (White) */}
      <div className="flex-1 flex items-center justify-between px-6 md:px-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Droplets className="h-6 w-6 md:h-7 md:w-7 text-white fill-white" />
          </div>
          <span className="hidden sm:block text-xl md:text-2xl font-black text-slate-900 tracking-tighter">DonSang</span>
        </Link>
        
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm md:text-base font-bold transition-all ${
                location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-slate-900 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
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
          <Link to="/login">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-4 h-9 font-black text-md shadow-2xl transition-all hover:scale-105">
              Sign In
            </Button>
          </Link>
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
                 className={` font-black text-sm md:text-slate-900 py-2 border-b border-slate-500font-bold transition-all ${
                location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-primary"
              }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
                <hr />
              </Link>
            ))}
          </div>
          <Link to="/login" className="w-full pt-6" onClick={() => setMobileOpen(false)}>
            <Button size="xl" className="w-full rounded-xl h-12 text-xl">Sign In</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
