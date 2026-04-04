import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, Phone, Eye, EyeOff, Building2 } from "lucide-react";

type AccountType = "patient" | "hospital";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("patient");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-md">
          <Heart className="h-16 w-16 mx-auto mb-6 fill-primary-foreground/20" />
          <h2 className="text-3xl font-bold mb-4">Rejoignez SangVital</h2>
          <p className="text-primary-foreground/80 text-lg">
            Créez votre dossier médical en quelques minutes et contribuez à sauver des vies.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
              <Heart className="h-7 w-7 text-primary fill-primary" />
              <span>Sang<span className="text-primary">Vital</span></span>
            </Link>
            <h1 className="text-2xl font-bold mt-6 mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Choisissez votre type de compte</p>
          </div>

          {/* Account type toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                accountType === "patient"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setAccountType("patient")}
            >
              <User className="h-4 w-4" />
              Patient
            </button>
            <button
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                accountType === "hospital"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setAccountType("hospital")}
            >
              <Building2 className="h-4 w-4" />
              Hôpital
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">
                {accountType === "patient" ? "Nom complet" : "Nom de l'établissement"}
              </Label>
              <div className="relative">
                {accountType === "patient" ? (
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input id="name" placeholder={accountType === "patient" ? "Votre nom" : "Nom de l'hôpital"} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="votre@email.com" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+212 600 000 000" className="pl-10" />
              </div>
            </div>

            {accountType === "patient" && (
              <div className="space-y-2">
                <Label htmlFor="blood-group">Groupe sanguin</Label>
                <select
                  id="blood-group"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez votre groupe</option>
                  <option value="A+">A+</option>
                  <option value="A-">A−</option>
                  <option value="B+">B+</option>
                  <option value="B-">B−</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB−</option>
                  <option value="O+">O+</option>
                  <option value="O-">O−</option>
                </select>
              </div>
            )}

            {accountType === "hospital" && (
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="Casablanca, Rabat, Marrakech..." />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button variant="hero" className="w-full" size="lg">
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
