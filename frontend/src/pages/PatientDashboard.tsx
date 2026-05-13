import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Heart, User, Droplets, FileText, Share2, Bell, Settings,
  Plus, Copy, RefreshCw, Download, Upload, AlertTriangle,
  Phone, MapPin, LogOut, ChevronRight, Lock
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];



const tabs = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "medical", label: "Dossier médical", icon: FileText },
  { id: "documents_share", label: "Partage du dossier", icon: Share2 },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [shareLink, setShareLink] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async (patientId: number) => {
    try {
      const data = await apiFetch(`/patients/${patientId}/documents`);
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async (patientId: number) => {
    try {
      const data = await apiFetch(`/patients/${patientId}/notifications`);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userData) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("category", "Autre");

    setUploadingDoc(true);
    try {
      const newDoc = await apiFetch(`/patients/${userData.id}/documents`, {
        method: "POST",
        body: formData,
      });
      setDocuments([newDoc, ...documents]);
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleGenerateShareToken = async () => {
    try {
      const data = await apiFetch("/generate-share-token", {
        method: "POST",
        body: JSON.stringify({ email: userData.email })
      });
      setShareLink(`${window.location.origin}/dossier/partage/${data.share_token}`);
      const newUserData = { ...userData, share_token: data.share_token };
      setUserData(newUserData);
      localStorage.setItem("userData", JSON.stringify(newUserData));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisableShareToken = async () => {
    try {
      await apiFetch("/disable-share-token", {
        method: "POST",
        body: JSON.stringify({ email: userData.email })
      });
      setShareLink("");
      const newUserData = { ...userData, share_token: null };
      setUserData(newUserData);
      localStorage.setItem("userData", JSON.stringify(newUserData));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvailabilityResponse = async (type: "disponible" | "indisponible", title: string, alertId?: number) => {
    if (!userData || !alertId) return;

    try {
      await apiFetch("/alerts/respond", {
        method: "POST",
        body: JSON.stringify({
          alert_id: alertId,
          patient_id: userData.id,
          status: type === "disponible" ? "available" : "unavailable"
        })
      });

      if (type === "disponible") {
        toast.success("Merci ! Votre disponibilité a été enregistrée. Un agent de santé pourrait vous contacter.", {
          description: `Réponse pour: ${title}`,
          duration: 5000,
        });
      } else {
        toast.info("C'est noté. Merci de nous avoir informés.", {
          description: `Réponse pour: ${title}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement de votre réponse.");
    }
  };

  useEffect(() => {
    const data = localStorage.getItem("userData");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    
    if (isAuth && data) {
      try {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        setProfileData({
          full_name: parsedData.full_name,
          email: parsedData.email,
          phone: parsedData.phone || "",
          address: parsedData.address || "",
          birth_date: parsedData.birth_date || "",
          blood_type: parsedData.blood_type || ""
        });
        if (parsedData.share_token) {
          setShareLink(`${window.location.origin}/dossier/partage/${parsedData.share_token}`);
        }
        fetchDocuments(parsedData.id);
        fetchNotifications(parsedData.id);
      } catch (e) {
        console.error("Error parsing userData", e);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passwords.new !== passwords.confirm) {
      setPassError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setPassLoading(true);
    try {
      const data = await apiFetch("/update-password", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          user_type: "patient",
          current_password: passwords.current,
          new_password: passwords.new
        }),
      });

      if (data.status === "success") {
        setPassSuccess(data.message);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setPassError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      setPassError(err.message || "Erreur de connexion au serveur");
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const data = await apiFetch("/update-profile", {
        method: "POST",
        body: JSON.stringify({
          ...profileData,
          user_type: "patient"
        }),
      });

      if (data.status === "success") {
        setProfileSuccess(data.message);
        setUserData(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));
      } else {
        setProfileError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      setProfileError(err.message || "Erreur de connexion au serveur");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar user={{ name: userData.full_name || userData.name || "Patient" }} />

      {/* Mobile Tab Bar — horizontal scrollable, sticky under navbar */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="space-y-4 sticky top-24">
            <div className="bg-card rounded-xl border border-border p-4 space-y-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Blood group card */}
            <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
              <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{userData.blood_type}</div>
              <div className="text-xs text-muted-foreground mt-1">Votre groupe sanguin</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Mon profil</h2>
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                {profileError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg font-bold animate-reveal">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg font-bold animate-reveal">
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

              {/* Security section - Password update */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Sécurité du compte
                </h3>
                
                {passError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 font-bold animate-reveal">
                    {passError}
                  </div>
                )}
                {passSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg mb-4 font-bold animate-reveal">
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
          )}


          {activeTab === "medical" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dossier médical</h2>
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maladies chroniques</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
                    value={(() => {
                      if (!userData?.chronic_diseases) return "Aucune";
                      if (Array.isArray(userData.chronic_diseases)) {
                        return userData.chronic_diseases.length > 0 ? userData.chronic_diseases.join(", ") : "Aucune";
                      }
                      try {
                        const parsed = JSON.parse(userData.chronic_diseases);
                        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(", ") : "Aucune";
                      } catch(e) {
                        return userData.chronic_diseases || "Aucune";
                      }
                    })()}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
                    value={userData?.allergies || "Aucune"}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Traitements en cours</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
                    value={userData?.current_treatments || "Aucun"}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Antécédents médicaux</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
                    value={userData?.medical_history || "Aucun"}
                    readOnly
                  />
                </div>
              </div>
              
              {/* Documents médicaux section added here */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Documents médicaux</h2>
                  <div>
                    <input 
                      type="file" 
                      id="document-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={uploadingDoc}
                    />
                    <label htmlFor="document-upload">
                      <Button variant="hero" size="sm" asChild disabled={uploadingDoc}>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingDoc ? "Chargement..." : "Ajouter un document"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-border divide-y divide-border shadow-sm overflow-hidden">
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">{doc.category} • {doc.date}</div>
                        </div>
                      </div>
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Aucun document médical disponible.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents_share" && (
            <div className="space-y-8">

              <div className="space-y-6">
                <h2 className="text-xl font-bold">Partager mon dossier</h2>
                <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Générez un lien sécurisé pour permettre à votre médecin de consulter votre dossier en lecture seule.
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      value={shareLink || "Aucun lien actif"} 
                      readOnly 
                      className="flex-1 font-mono text-xs bg-muted/30" 
                    />
                    {shareLink && (
                      <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => navigator.clipboard.writeText(shareLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="hero" size="sm" className="rounded-xl" onClick={handleGenerateShareToken}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {shareLink ? "Régénérer le lien" : "Générer un lien"}
                    </Button>
                    {shareLink && (
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl" onClick={handleDisableShareToken}>
                        Désactiver le lien
                      </Button>
                    )}
                  </div>
                  {shareLink && (
                    <div className="bg-muted/50 rounded-xl p-4 text-sm border border-border/50">
                      <div className="font-bold text-slate-900 mb-2">Paramètres du lien</div>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Durée de validité : 30 jours
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Accès : Lecture seule
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Statut : Actif
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Notifications</h2>
              <div className="space-y-3">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={n.id || i} className={`bg-card rounded-xl border p-4 flex items-start gap-3 ${n.urgent ? "border-primary" : "border-border"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.urgent ? "hero-gradient text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                    </div>
                    {n.urgent && (
                      <div className="flex gap-2">
                        <Button 
                          variant="hero" 
                          size="sm"
                          onClick={() => handleAvailabilityResponse("disponible", n.title, n.alert_id)}
                        >
                          Disponible
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAvailabilityResponse("indisponible", n.title, n.alert_id)}
                        >
                          Indisponible
                        </Button>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-xl">
                    Aucune notification pour le moment.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
