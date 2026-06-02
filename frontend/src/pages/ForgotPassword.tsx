import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const f = t.passwordReset;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage(f.emailRequired);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (data.status === "success") {
        setStatus("success");
        setMessage(data.message || f.resetSent);
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{f.forgotTitle}</h2>
          </div>
          <p className="text-slate-500 text-sm">{f.forgotSubtitle}</p>
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
                <ArrowLeft className="h-4 w-4" />
                {f.backToLogin}
              </Link>
            </div>
          ) : (
            <form method="POST" className="space-y-6" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-bold">{t.login.email}</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder} 
                    className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all px-6 text-base bg-slate-50" 
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={status === "loading"}
                className="w-full h-12 rounded-lg bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {status === "loading" ? t.contact.sending : f.sendLink}
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
