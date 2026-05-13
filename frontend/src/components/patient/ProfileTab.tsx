import { User, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface ProfileTabProps {
  profileData: any;
  setProfileData: (data: any) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileLoading: boolean;
  profileSuccess: string;
  profileError: string;
  passwords: any;
  setPasswords: (data: any) => void;
  handleUpdatePassword: (e: React.FormEvent) => void;
  passLoading: boolean;
  passSuccess: string;
  passError: string;
}

export function ProfileTab({
  profileData,
  setProfileData,
  handleUpdateProfile,
  profileLoading,
  profileSuccess,
  profileError,
  passwords,
  setPasswords,
  handleUpdatePassword,
  passLoading,
  passSuccess,
  passError
}: ProfileTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold">Mon profil</h2>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        {profileError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg font-bold">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg font-bold">
            {profileSuccess}
          </div>
        )}
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <Input 
                value={profileData?.full_name || ""} 
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input 
                value={profileData?.email || ""} 
                readOnly
                className="mt-1 bg-muted/30" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <Input 
                value={profileData?.phone || ""} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ville / Adresse</label>
              <Input 
                value={profileData?.address || ""} 
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
              <Input 
                type="date" 
                value={profileData?.birth_date || ""} 
                onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Groupe sanguin</label>
              <select 
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profileData?.blood_type || ""}
                onChange={(e) => setProfileData({...profileData, blood_type: e.target.value})}
              >
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" variant="hero" className="mt-6" disabled={profileLoading}>
            {profileLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </div>

      {/* Emergency contact */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Contact d'urgence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nom</label>
            <Input defaultValue="Hassania El-Falah" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Relation</label>
            <Input defaultValue="Sœur" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
            <Input defaultValue="+212 600 789 012" className="mt-1" />
          </div>
        </div>
      </div>

      {/* Security section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Sécurité du compte
        </h3>
        
        {passError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 font-bold">
            {passError}
          </div>
        )}
        {passSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg mb-4 font-bold">
            {passSuccess}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mot de passe actuel</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Nouveau mot de passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Confirmer le nouveau mot de passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="hero" 
            className="mt-2 w-full sm:w-auto px-8"
            disabled={passLoading}
          >
            {passLoading ? "Mise à jour..." : "Modifier le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}
