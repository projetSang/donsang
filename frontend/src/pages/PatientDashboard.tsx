import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  User, Droplets, FileText, Share2, Bell, RefreshCw, Crown, Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientData } from "@/hooks/usePatientData";
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
  const { user: userData, updateUser, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const {
    documents,
    notifications,
    uploadingDoc,
    shareLink,
    handleFileUpload,
    generateShareToken,
    disableShareToken,
    respondToAlert: handleAvailabilityResponse
  } = usePatientData(userData, authLoading, logout);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && userData) {
      setProfileData({
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        birth_date: userData.birth_date || "",
        blood_type: userData.blood_type || "",
        emergency_contact_name: userData.emergency_contact_name || "",
        emergency_contact_relation: userData.emergency_contact_relation || "",
        emergency_contact_phone: userData.emergency_contact_phone || "",
        is_king: userData.is_king,
        donations_count: userData.donations_count || 0
      });
    }
  }, [userData, authLoading]);

  const refreshUserData = async () => {
    if (!userData?.email) return;
    try {
      const data = await apiFetch("/get-profile", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          user_type: "patient"
        })
      });
      if (data.status === "success") {
        updateUser(data.user);
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  useEffect(() => {
    if (userData?.email) {
      refreshUserData();
    }
  }, [userData?.email]);

  const handleGenerateShareToken = async () => {
    const token = await generateShareToken();
    if (token) {
      updateUser({ ...userData, share_token: token });
    }
  };

  const handleDisableShareToken = async () => {
    const success = await disableShareToken();
    if (success) {
      updateUser({ ...userData, share_token: null });
    }
  };

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
    console.log("Updating profile with data:", profileData);

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
        updateUser(data.user);
      } else {
        setProfileError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileError(err.message || "Erreur de connexion au serveur");
    } finally {
      setProfileLoading(false);
    }
  };

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar />

      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm flex flex-col items-center justify-center">
              <Droplets className="h-8 w-8 text-primary mb-2 animate-pulse" />
              <div className="text-3xl font-bold text-primary">{userData.blood_type}</div>
              <div className="text-xs text-muted-foreground mt-1">Votre groupe sanguin</div>
            </div>

            {(() => {
              const count = userData.donations_count || 0;
              if (count === 0) {
                return (
                  <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-slate-300 relative overflow-hidden group">
                    <div className="relative mb-2 flex flex-col items-center opacity-40">
                      {/* Rosette Outer Border */}
                      <div className="w-14 h-14 rounded-full bg-slate-350 border-2 border-slate-450 shadow-md flex items-center justify-center z-10 relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center border border-slate-300 shadow-sm relative">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex flex-col items-center justify-center">
                            <span className="font-black text-lg leading-none text-slate-400">?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-400">0</div>
                    <div className="text-xs text-slate-500 font-bold mt-1">Nombre de dons</div>
                  </div>
                );
              }

              // Otherwise show Bronze, Silver, or Gold medal
              let medalClass = "from-orange-200 via-orange-300 to-orange-500 border-orange-400/60";
              let outerRosette = "bg-orange-500 border-orange-600";
              let textNumClass = "text-orange-950";
              let numStr = "3";
              let bgGlow = "from-orange-50/60 to-white border-orange-200/80";
              let countTextClass = "text-orange-800";
              let numColor = "text-orange-600";

              if (count >= 6) {
                medalClass = "from-amber-200 via-yellow-300 to-amber-500 border-amber-400/60";
                outerRosette = "bg-amber-500 border-amber-600";
                textNumClass = "text-amber-950";
                numStr = "1";
                bgGlow = "from-amber-50/60 to-white border-amber-200/80";
                countTextClass = "text-amber-800";
                numColor = "text-amber-600";
              } else if (count >= 3) {
                medalClass = "from-slate-100 via-slate-200 to-slate-400 border-slate-300";
                outerRosette = "bg-slate-400 border-slate-500";
                textNumClass = "text-slate-950";
                numStr = "2";
                bgGlow = "from-slate-50/60 to-white border-slate-200/80";
                countTextClass = "text-slate-800";
                numColor = "text-slate-600";
              }

              return (
                <div className={`bg-gradient-to-br ${bgGlow} rounded-xl border p-4 text-center shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-amber-300 relative overflow-hidden group`}>
                  {/* Rosette Medal Icon with Ribbons */}
                  <div className="relative mb-2 flex flex-col items-center animate-reveal">
                    {/* Rosette Outer Pleated Border */}
                    <div className={`w-14 h-14 rounded-full ${outerRosette} border-2 shadow-md flex items-center justify-center z-10 relative`}>
                      {/* Inner Ring */}
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-b ${medalClass} flex items-center justify-center border shadow-sm relative`}>
                        {/* Center */}
                        <div className="w-8 h-8 rounded-full bg-white/95 flex flex-col items-center justify-center border border-white/40 shadow-inner">
                          <span className={`font-black text-lg leading-none ${textNumClass}`}>{numStr}</span>
                        </div>
                      </div>
                    </div>
                    {/* Ribbons */}
                    <div className="flex gap-2 -mt-2 z-0 relative">
                      {/* Left Ribbon */}
                      <div className="w-4.5 h-6 bg-gradient-to-b from-red-600 to-red-700 border-x border-amber-400 rounded-b-sm transform -rotate-12 origin-top relative overflow-hidden">
                        <div className="absolute inset-y-0 left-1.5 right-1.5 bg-amber-400/80"></div>
                      </div>
                      {/* Right Ribbon */}
                      <div className="w-4.5 h-6 bg-gradient-to-b from-red-600 to-red-700 border-x border-amber-400 rounded-b-sm transform rotate-12 origin-top relative overflow-hidden">
                        <div className="absolute inset-y-0 left-1.5 right-1.5 bg-amber-400/80"></div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-3xl font-extrabold ${numColor}`}>{userData.donations_count || 0}</div>
                  <div className={`text-xs ${countTextClass} font-bold mt-1`}>Nombre de dons</div>
                </div>
              );
            })()}

            {userData.is_king && (
              <div className="bg-gradient-to-br from-amber-400 to-amber-200 border border-amber-300 rounded-xl p-4 text-center shadow-md animate-bounce flex flex-col items-center justify-center">
                <Crown className="h-8 w-8 text-amber-800 mb-2" />
                <div className="text-lg font-black text-amber-900">L'Héro (Roi)</div>
                <div className="text-[10px] text-amber-800 font-semibold leading-tight">Vous êtes le meilleur donneur !</div>
              </div>
            )}
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
