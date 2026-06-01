import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.status === "success") {
        login(data.user, data.token);
      } else {
        setError(data.message || t.login.submit);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f8] flex flex-col items-center justify-center p-6 py-1">
      <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
        <div className="text-center group">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-4">
              <img src="logo_sang.png" alt="SangVital Logo" width={180} height={180} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.login.title}</h2>
          </div>
          <p className="text-slate-500 text-sm">{t.login.subtitle}</p>
        </div>

        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
              {error}
            </div>
          )}
          <form method="POST" className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" title="email" className="text-slate-900 font-bold">{t.login.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login.emailPlaceholder}
                className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" title="password" className="text-slate-900 font-bold">{t.login.password}</Label>
                <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">{t.login.forgotPassword}</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.login.passwordPlaceholder}
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
              {loading ? t.login.loading : t.login.submit}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-500 text-sm">
              {t.login.noAccount}{" "}
              <Link to="/register" className="text-primary font-bold hover:underline">
                {t.login.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
