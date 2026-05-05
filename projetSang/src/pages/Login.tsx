import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Droplets } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", data.user_type);
        localStorage.setItem("userData", JSON.stringify(data.user));

        if (data.user_type === "hospital") {
          navigate("/hospital");
        } else {
          navigate("/patient");
        }
      } else {
        setError(data.message || "Identifiants invalides");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connexion</h2>
           </div>
          <p className="text-slate-500 text-sm">Accédez à votre espace médical sécurisé</p>
          
        </div>

        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
             <Label htmlFor="email font-bold" title="email" className="text-slate-900 font-bold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre Email" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base" 
                />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password font-bold" title="password" className="text-slate-900 font-bold">Mot de passe</Label>
                <a href="#" className="text-xs text-primary font-bold hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot De Passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>


        </div>
       
      </div>
    </div>
  );
}
