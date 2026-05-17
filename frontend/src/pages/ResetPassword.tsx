import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !passwordConfirmation) {
      setStatus("error");
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!token || !email) {
      setStatus("error");
      setMessage("Jeton de réinitialisation ou email manquant dans le lien.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation
        }),
      });

      if (data.status === "success") {
        setStatus("success");
        setMessage(data.message || "Votre mot de passe a été réinitialisé.");
      } else {
        setStatus("error");
        setMessage(data.message || "Une erreur est survenue.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Erreur de connexion au serveur.");
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Réinitialiser le mot de passe</h2>
          </div>
          <p className="text-slate-500 text-sm">Veuillez saisir votre nouveau mot de passe sécurisé</p>
        </div>

        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 space-y-8">
          
          {status === "success" ? (
            <div className="space-y-6 text-center animate-reveal">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-5 rounded-2xl font-medium leading-relaxed">
                {message}
              </div>
              <Link 
                to="/login"
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline justify-center w-full pt-4"
              >
                Se connecter avec le nouveau mot de passe &rarr;
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
                  {message}
                </div>
              )}

              {(!token || !email) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl font-medium">
                  ⚠️ <strong>Attention :</strong> Ce lien semble incomplet ou invalide. Assurez-vous d'avoir cliqué sur le lien complet reçu par email.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-bold">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nouveau Mot De Passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base pr-14"
                    disabled={status === "loading"}
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

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-slate-900 font-bold">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer Le Mot De Passe"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base pr-14"
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={status === "loading" || !token || !email}
                className="w-full h-12 rounded-lg bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {status === "loading" ? "Réinitialisation..." : "Réinitialiser"}
              </Button>

              <div className="text-center pt-2">
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
