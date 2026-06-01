import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPassword() {
  const { t } = useLanguage();
  const f = t.passwordReset;

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
      setMessage(f.fillAll);
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage(f.passwordMin);
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus("error");
      setMessage(f.passwordMismatch);
      return;
    }

    if (!token || !email) {
      setStatus("error");
      setMessage(f.missingToken);
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
        setMessage(data.message || f.resetSuccess);
      } else {
        setStatus("error");
        setMessage(data.message || f.errorOccurred);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || f.connError);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f8] flex flex-col items-center justify-center p-6 py-1 animate-reveal">
      <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center group">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-4">
              <img src="logo_sang.png" alt="SangVital Logo" width={180} height={180} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{f.resetTitle}</h2>
          </div>
          <p className="text-slate-500 text-sm">{f.resetSubtitle}</p>
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
                {f.connectNewPassword} &rarr;
              </Link>
            </div>
          ) : (
            <form method="POST" className="space-y-6" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
                  {message}
                </div>
              )}

              {(!token || !email) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl font-medium leading-relaxed">
                  ⚠️ {f.incompleteLink}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-bold">{f.newPassword}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={f.newPasswordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base pr-14 bg-slate-50"
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
                <Label htmlFor="password_confirmation" className="text-slate-900 font-bold">{f.confirmNewPassword}</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={f.confirmPasswordPlaceholder}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base pr-14 bg-slate-50"
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
                {status === "loading" ? f.resetting : f.resetBtn}
              </Button>

              <div className="text-center pt-2">
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {f.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
