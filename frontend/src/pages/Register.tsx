import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Phone, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.status === "success") {
        toast({
          title: "Succès",
          description: "Votre compte a été créé avec succès",
        });
        login(data.user, data.token);
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f8] flex flex-col items-center justify-center p-6 py-10">
      <div className="w-full max-w-2xl space-y-8 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center group">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-4">
              <Link to="/">
                <img src="logo_sang.png" alt="SangVital Logo" width={150} height={150} />
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Inscription Donneur</h2>
          </div>
          <p className="text-slate-500 text-sm">Rejoignez la communauté et sauvez des vies</p>
        </div>

        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-10 space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
              {error}
            </div>
          )}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleRegister}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name" className="text-slate-900 font-bold">Nom Complet</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input 
                  id="full_name" 
                  type="text" 
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ex: Ahmed Alaoui" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900 font-bold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input 
                  id="email" 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-900 font-bold">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input 
                  id="phone" 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 00 00 00 00" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-slate-900 font-bold">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 pr-12 text-base"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-slate-900 font-bold">Confirmer</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 pr-12 text-base"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-500 text-sm">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
