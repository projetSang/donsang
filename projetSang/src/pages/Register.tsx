import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, Eye, EyeOff, Building2, Droplets } from "lucide-react";

type AccountType = "patient" | "hospital";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("patient");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("isAuthenticated", "true");
    navigate("/patient");
  };

  return (
    <div className="min-h-screen bg-[#faf8f8] flex flex-col items-center justify-center p-6 py-1">
      <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center group">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-4">
              <img src="logo_sang.png" alt="SangVital Logo" width={180} height={180} />
            </div>
           <h1 className="text-2xl font-bold text-slate-900 mb-2">Inscription</h1>
            </div>
          <p className="text-slate-500 text-sm">Créez votre compte pour accéder à la plateforme</p>
          
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 space-y-8">

          <div className="space-y-6">
           <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900 font-bold px-1">
                  Nom complet
                </Label>
                <Input 
                  id="name" 
                  placeholder= "Votre Nom" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-bold px-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Votre Email" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-900 font-bold px-1">Téléphone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Numéro Téléphone" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-slate-900 font-bold px-1">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot De Passe"
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base pr-14"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <Button size="lg" className="w-full h-12 rounded-lg bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                S'inscrire
              </Button>
            </form>

            <div className="text-center space-y-2 pt-4">
              <b>Déjà un compte ? </b>
              <Link to="/login" className="text-primary font-black hover:underline tracking-tight">
                 Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
