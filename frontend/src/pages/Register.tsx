import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Phone, Droplets, MapPin, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    cin: "",
    email: "",
    phone: "",
    city: "",
    blood_type: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError(t.register.passwordMismatch);
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
          title: t.register.successTitle,
          description: t.register.successDesc,
        });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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
        {/* Logo */}
        <div className="text-center group">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-4">
              <Link to="/">
                <img src="/logo_login.png" alt="SangVital Logo" width={150} height={150} />
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.register.title}</h2>
          </div>
          <p className="text-slate-500 text-sm">{t.register.subtitle}</p>
        </div>

        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-10 space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl text-center font-bold animate-reveal">
              {error}
            </div>
          )}
          <form method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name" className="text-slate-900 font-bold">{t.register.fullName}</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder={t.register.fullNamePlaceholder}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base"
                />
              </div>
            </div>

            {/* CIN */}
            <div className="space-y-2">
              <Label htmlFor="cin" className="text-slate-900 font-bold">
                {t.register.cin} <span className="text-slate-400 font-normal text-xs">{t.register.cinOptional}</span>
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="cin"
                  type="text"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder={t.register.cinPlaceholder}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900 font-bold">{t.register.email}</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.register.emailPlaceholder}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-900 font-bold">{t.register.phone}</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.register.phonePlaceholder}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-slate-900 font-bold">{t.register.city}</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  id="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t.register.cityPlaceholder}
                  className="h-12 rounded-xl border-slate-200 focus:border-primary transition-all pl-12 text-base"
                />
              </div>
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="blood_type" className="text-slate-900 font-bold">{t.register.bloodType}</Label>
              <div className="relative">
                <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <select
                  id="blood_type"
                  aria-label={t.register.bloodType}
                  title={t.register.bloodType}
                  required
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all pl-12 pr-4 text-base appearance-none"
                >
                  <option value="">{t.register.bloodTypeDefault}</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-slate-900 font-bold">{t.register.password}</Label>
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-slate-900 font-bold">{t.register.confirm}</Label>
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

            {/* Submit */}
            <div className="md:col-span-2 pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-white text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? t.register.loading : t.register.submit}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-500 text-sm">
              {t.register.alreadyAccount}{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">
                {t.register.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
