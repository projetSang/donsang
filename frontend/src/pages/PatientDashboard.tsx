import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  User, Droplets, FileText, Share2, Bell, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// Import sub-components
import { ProfileTab } from "@/components/patient/ProfileTab";
import { MedicalTab } from "@/components/patient/MedicalTab";
import { ShareTab } from "@/components/patient/ShareTab";
import { NotificationsTab } from "@/components/patient/NotificationsTab";

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
      toast.success("Document ajouté avec succès");
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Erreur lors de l'upload");
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
      toast.success("Lien de partage généré");
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
      toast.info("Lien de partage désactivé");
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
        toast.success("Merci ! Votre disponibilité a été enregistrée.", {
          description: `Réponse pour: ${title}`,
        });
      } else {
        toast.info("C'est noté. Merci.", {
          description: `Réponse pour: ${title}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
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

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar user={{ name: userData.full_name || userData.name || "Patient" }} />

      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="space-y-4 sticky top-24">
            <div className="bg-card rounded-xl border border-border p-4 space-y-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
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
            <ProfileTab 
              profileData={profileData} 
              setProfileData={setProfileData}
              handleUpdateProfile={handleUpdateProfile}
              profileLoading={profileLoading}
              profileSuccess={profileSuccess}
              profileError={profileError}
              passwords={passwords}
              setPasswords={setPasswords}
              handleUpdatePassword={handleUpdatePassword}
              passLoading={passLoading}
              passSuccess={passSuccess}
              passError={passError}
            />
          )}

          {activeTab === "medical" && (
            <MedicalTab 
              userData={userData}
              documents={documents}
              uploadingDoc={uploadingDoc}
              handleFileUpload={handleFileUpload}
            />
          )}

          {activeTab === "documents_share" && (
            <ShareTab 
              shareLink={shareLink}
              handleGenerateShareToken={handleGenerateShareToken}
              handleDisableShareToken={handleDisableShareToken}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab 
              notifications={notifications}
              handleAvailabilityResponse={handleAvailabilityResponse}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
