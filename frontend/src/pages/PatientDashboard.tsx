import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  User, Droplets, FileText, Share2, Bell, RefreshCw, Crown, Award, Printer, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientData } from "@/hooks/usePatientData";
import { apiFetch } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";


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
  const [showCertificate, setShowCertificate] = useState(false);

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

  const { userName } = useParams();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const expectedSlug = slugify(userData.full_name || userData.name || "patient");
  if (userName !== expectedSlug) {
    return <Navigate to={`/Donsang/Mon-dossier/${expectedSlug}`} replace />;
  }
  const count = userData.donations_count || 0;
  let sealTitle = "BRONZE";
  let borderColor = "#ea580c"; // orange-600
  let innerBorderColor = "#ffedd5"; // orange-100
  let bgColor = "#fff7ed"; // orange-50
  let starLight = "#ffedd5";
  let starDark = "#9a3412";
  let wreathColor = "#9a3412";
  let medalGradSelected = "url(#certBronzeMedalPrint)";
  let innerGradSelected = "url(#certBronzeInnerPrint)";

  if (count >= 6) {
    sealTitle = "OR";
    borderColor = "#ca8a04"; // gold-600
    innerBorderColor = "#fef9c3"; // gold-100
    bgColor = "#fffbeb"; // gold-50
    starLight = "#fef08a";
    starDark = "#ca8a04";
    wreathColor = "#ca8a04";
    medalGradSelected = "url(#certGoldMedalPrint)";
    innerGradSelected = "url(#certGoldInnerPrint)";
  } else if (count >= 3) {
    sealTitle = "ARGENT";
    borderColor = "#475569"; // slate-600
    innerBorderColor = "#f1f5f9"; // slate-100
    bgColor = "#f8fafc"; // slate-50
    starLight = "#f8fafc";
    starDark = "#64748b";
    wreathColor = "#64748b";
    medalGradSelected = "url(#certSilverMedalPrint)";
    innerGradSelected = "url(#certSilverInnerPrint)";
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;600;800&family=Playfair+Display:ital,wght@1,600&display=swap');
        
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          .no-print, [data-radix-portal], .fixed, .inset-0, [role="dialog"], button[aria-haspopup="dialog"] {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            size: A4 landscape;
            margin: 0;
          }

          .print-certificate-page {
            width: 297mm !important;
            height: 210mm !important;
            box-sizing: border-box !important;
            background-color: #ffffff !important;
            background-image: radial-gradient(var(--cert-bg-dot-color) 1px, transparent 1px) !important;
            background-size: 20px 20px !important;
            padding: 24mm 30mm !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: space-between !important;
            font-family: 'Montserrat', sans-serif !important;
          }

          .print-outer-border {
            position: absolute !important;
            top: 10mm !important;
            left: 10mm !important;
            right: 10mm !important;
            bottom: 10mm !important;
            border: 8px double var(--cert-border-color) !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
          }

          .print-inner-border {
            position: absolute !important;
            top: 13mm !important;
            left: 13mm !important;
            right: 13mm !important;
            bottom: 13mm !important;
            border: 2px dashed var(--cert-border-color-alpha) !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
          }

          .print-corner {
            position: absolute !important;
            width: 30px !important;
            height: 30px !important;
            border-color: var(--cert-border-color) !important;
            border-style: solid !important;
            pointer-events: none !important;
          }
          .print-top-left { top: 16mm !important; left: 16mm !important; border-width: 3px 0 0 3px !important; }
          .print-top-right { top: 16mm !important; right: 16mm !important; border-width: 3px 3px 0 0 !important; }
          .print-bottom-left { bottom: 16mm !important; left: 16mm !important; border-width: 0 0 3px 3px !important; }
          .print-bottom-right { bottom: 16mm !important; right: 16mm !important; border-width: 0 3px 3px 0 !important; }

          .print-header {
            text-align: center !important;
          }

          .print-header h1 {
            font-family: 'Cinzel', serif !important;
            font-size: 14px !important;
            letter-spacing: 5px !important;
            color: #64748b !important;
            margin: 0 0 5px 0 !important;
            font-weight: 750 !important;
          }

          .print-divider {
            height: 2px !important;
            width: 80px !important;
            background-color: var(--cert-border-color-alpha2) !important;
            margin: 5px auto !important;
          }

          .print-header h2 {
            font-size: 10px !important;
            letter-spacing: 3px !important;
            color: #475569 !important;
            margin: 5px 0 0 0 !important;
            font-weight: 600 !important;
          }

          .print-title-section {
            text-align: center !important;
            margin: 3mm 0 !important;
          }

          .print-title-section h3 {
            font-family: 'Cinzel', serif !important;
            font-size: 32px !important;
            font-weight: 900 !important;
            letter-spacing: 2px !important;
            color: #0f172a !important;
            margin: 0 !important;
          }

          .print-title-section p {
            font-family: 'Playfair Display', serif !important;
            font-size: 15px !important;
            color: #e11d48 !important;
            margin: 4px 0 0 0 !important;
            font-style: italic !important;
            font-weight: 600 !important;
          }

          .print-recipient-section {
            text-align: center !important;
            width: 85% !important;
            margin: 0 auto !important;
          }

          .print-recipient-label {
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 4px !important;
            color: #64748b !important;
            font-weight: 800 !important;
            margin: 0 !important;
          }

          .print-recipient-name {
            font-family: 'Cinzel', serif !important;
            font-size: 28px !important;
            color: #1e293b !important;
            margin: 8px auto !important;
            font-weight: 900 !important;
            border-bottom: 2px solid #e2e8f0 !important;
            padding-bottom: 4px !important;
            display: inline-block !important;
            min-width: 320px !important;
          }

          .print-certificate-text {
            font-size: 11.5px !important;
            line-height: 1.8 !important;
            color: #475569 !important;
            margin: 0 !important;
            font-weight: 400 !important;
          }

          .print-footer-section {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            width: 95% !important;
            margin: 4mm auto 0 auto !important;
          }

          .print-sig-block {
            width: 60mm !important;
            border-bottom: 1.5px solid #cbd5e1 !important;
            padding-bottom: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-end !important;
            height: 20mm !important;
          }

          .print-sig-label {
            font-size: 9px !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            color: #94a3b8 !important;
            font-weight: 600 !important;
            margin-bottom: 4px !important;
          }

          .print-sig-val {
            font-size: 12px !important;
            font-weight: 800 !important;
            color: #334155 !important;
          }

          .print-sig-val.italic {
            font-family: 'Playfair Display', serif !important;
            font-style: italic !important;
            color: #e11d48 !important;
          }

          .print-seal-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: -15px !important;
          }

          .print-seal-label {
            font-size: 8px !important;
            font-weight: 800 !important;
            letter-spacing: 3px !important;
            color: #64748b !important;
            margin-top: 8px !important;
          }

          .print-watermark {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 300px !important;
            height: 300px !important;
            opacity: 0.03 !important;
            pointer-events: none !important;
            z-index: 0 !important;
          }
        }
      `}</style>
      <div className="no-print min-h-screen bg-muted/30 pt-18 md:pt-16">
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
                      {/* Grey placeholder medal */}
                      <svg viewBox="0 0 100 120" className="w-16 h-20 select-none">
                        <path d="M 40 70 L 15 110 L 38 98 L 50 70 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                        <path d="M 60 70 L 85 110 L 62 98 L 50 70 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                        <circle cx="50" cy="45" r="38" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
                        <circle cx="50" cy="45" r="31" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                      </svg>
                      <span className="absolute top-[28px] left-1/2 -translate-x-1/2 font-black text-lg text-slate-400">?</span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-400">0</div>
                    <div className="text-xs text-slate-500 font-bold mt-1">Nombre de dons</div>
                  </div>
                );
              }

              // Define tier properties for Gold, Silver, and Bronze
              let tier: "gold" | "silver" | "bronze" = "bronze";
              let title = "Insigne de Bronze";
              let bgGlow = "from-orange-50/60 to-white border-orange-200/80";
              let countTextClass = "text-orange-850";
              let numColor = "text-orange-700";
              let labelText = "Donneur de Bronze";

              if (count >= 6) {
                tier = "gold";
                title = "Insigne d'Or";
                bgGlow = "from-amber-50/60 to-white border-amber-200/80";
                countTextClass = "text-amber-850";
                numColor = "text-amber-700";
                labelText = "Donneur d'Or";
              } else if (count >= 3) {
                tier = "silver";
                title = "Insigne d'Argent";
                bgGlow = "from-slate-50/60 to-white border-slate-200/80";
                countTextClass = "text-slate-850";
                numColor = "text-slate-700";
                labelText = "Donneur d'Argent";
              }

              // Color configs based on tier
              const isGold = tier === "gold";
              const isSilver = tier === "silver";
              
              const medalGrad = isGold 
                ? "url(#goldMedal)" 
                : isSilver 
                  ? "url(#silverMedal)" 
                  : "url(#bronzeMedal)";
              const innerGrad = isGold 
                ? "url(#goldInner)" 
                : isSilver 
                  ? "url(#silverInner)" 
                  : "url(#bronzeInner)";
              
              const starLight = isGold ? "#fef08a" : isSilver ? "#f8fafc" : "#ffedd5";
              const starDark = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";
              const wreathColor = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";

              return (
                <div 
                  onClick={() => setShowCertificate(true)}
                  className={`bg-gradient-to-br ${bgGlow} rounded-xl border p-4 text-center shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-amber-300 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                  title="Cliquez pour voir votre certificat"
                >
                  
                  {/* High Fidelity Certificate Badge SVG */}
                  <div className="relative mb-2 flex flex-col items-center animate-reveal">
                    <svg viewBox="0 0 100 120" className="w-20 h-24 drop-shadow-md select-none">
                      <defs>
                        {/* Gold Gradients */}
                        <linearGradient id="goldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fffbeb" />
                          <stop offset="25%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="75%" stopColor="#ca8a04" />
                          <stop offset="100%" stopColor="#854d0e" />
                        </linearGradient>
                        <linearGradient id="goldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fef9c3" />
                          <stop offset="100%" stopColor="#ca8a04" />
                        </linearGradient>
                        
                        {/* Silver Gradients */}
                        <linearGradient id="silverMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f8fafc" />
                          <stop offset="25%" stopColor="#e2e8f0" />
                          <stop offset="50%" stopColor="#cbd5e1" />
                          <stop offset="75%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        <linearGradient id="silverInner" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f1f5f9" />
                          <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>

                        {/* Bronze Gradients */}
                        <linearGradient id="bronzeMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fff7ed" />
                          <stop offset="25%" stopColor="#ffedd5" />
                          <stop offset="50%" stopColor="#fdba74" />
                          <stop offset="75%" stopColor="#c2410c" />
                          <stop offset="100%" stopColor="#7c2d12" />
                        </linearGradient>
                        <linearGradient id="bronzeInner" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ffedd5" />
                          <stop offset="100%" stopColor="#9a3412" />
                        </linearGradient>

                        {/* Ribbon Gradient */}
                        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#991b1b" />
                          <stop offset="35%" stopColor="#dc2626" />
                          <stop offset="65%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#7f1d1d" />
                        </linearGradient>

                        {/* Shadow Filter */}
                        <filter id="medalShadow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.25"/>
                        </filter>
                      </defs>
                      
                      {/* Ribbons */}
                      {/* Left Ribbon */}
                      <path 
                        d="M 40 70 L 15 110 L 38 98 L 50 70 Z" 
                        fill="url(#ribbonGrad)" 
                        stroke="#f59e0b" 
                        strokeWidth="1.2" 
                        strokeLinejoin="round" 
                        filter="url(#medalShadow)"
                      />
                      {/* Right Ribbon */}
                      <path 
                        d="M 60 70 L 85 110 L 62 98 L 50 70 Z" 
                        fill="url(#ribbonGrad)" 
                        stroke="#f59e0b" 
                        strokeWidth="1.2" 
                        strokeLinejoin="round" 
                        filter="url(#medalShadow)"
                      />

                      {/* Main Medal Base (Outer Circle) */}
                      <circle 
                        cx="50" 
                        cy="45" 
                        r="38" 
                        fill={medalGrad} 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        filter="url(#medalShadow)"
                      />
                      
                      {/* Inner Raised Ring */}
                      <circle 
                        cx="50" 
                        cy="45" 
                        r="31" 
                        fill={innerGrad} 
                        stroke="rgba(255,255,255,0.3)" 
                        strokeWidth="1" 
                      />

                      {/* Laurel Wreath flanking the sides */}
                      {/* Left Branch Leaves */}
                      <g fill={wreathColor} opacity="0.65">
                        <path d="M 28 35 C 25 37, 24 41, 27 44 C 29 42, 29 38, 28 35 Z" />
                        <path d="M 25 43 C 22 45, 21 49, 24 52 C 26 50, 26 46, 25 43 Z" />
                        <path d="M 25 51 C 23 54, 23 58, 27 60 C 29 58, 28 54, 25 51 Z" />
                        <path d="M 29 58 C 28 61, 30 64, 34 65 C 36 63, 34 59, 29 58 Z" />
                        <path d="M 33 28 C 31 30, 31 34, 34 36 C 36 34, 35 30, 33 28 Z" />
                      </g>

                      {/* Right Branch Leaves */}
                      <g fill={wreathColor} opacity="0.65">
                        <path d="M 72 35 C 75 37, 76 41, 73 44 C 71 42, 71 38, 72 35 Z" />
                        <path d="M 75 43 C 78 45, 79 49, 76 52 C 74 50, 74 46, 75 43 Z" />
                        <path d="M 75 51 C 77 54, 77 58, 73 60 C 71 58, 72 54, 75 51 Z" />
                        <path d="M 71 58 C 72 61, 70 64, 66 65 C 64 63, 66 59, 71 58 Z" />
                        <path d="M 67 28 C 69 30, 69 34, 66 36 C 64 34, 65 30, 67 28 Z" />
                      </g>

                      {/* 3D Embossed Star at the Center */}
                      <g>
                        {/* Top Point */}
                        <polygon points="50,25 50,45 46,39" fill={starLight} />
                        <polygon points="50,25 54,39 50,45" fill={starDark} />
                        
                        {/* Right Point */}
                        <polygon points="68,39 50,45 54,39" fill={starLight} />
                        <polygon points="68,39 56,46 50,45" fill={starDark} />
                        
                        {/* Bottom Right Point */}
                        <polygon points="61,58 50,45 56,46" fill={starLight} />
                        <polygon points="61,58 50,50 50,45" fill={starDark} />
                        
                        {/* Bottom Left Point */}
                        <polygon points="39,58 50,45 50,50" fill={starLight} />
                        <polygon points="39,58 44,46 50,45" fill={starDark} />
                        
                        {/* Left Point */}
                        <polygon points="32,39 50,45 44,46" fill={starLight} />
                        <polygon points="32,39 46,39 50,45" fill={starDark} />
                      </g>
                    </svg>
                  </div>
                  <div className={`text-xl font-black ${numColor}`}>{title}</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1">{count} {count > 1 ? 'dons' : 'don'}</div>
                  <div className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{labelText}</div>
                </div>
              );
            })()}

           
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
              onViewCertificate={() => setShowCertificate(true)}
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

      {/* Certificate Modal */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-[95vw] md:max-w-[700px] p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-3xl no-print">
          <div className="flex flex-col h-full">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-extrabold text-slate-800 text-sm">Mon Certificat d'Honneur</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 mr-6"
                >
                  <Printer className="h-4 w-4" />
                  Imprimer / PDF
                </button>
              </div>
            </div>

            {/* Certificate Template */}
            <div className="p-6 md:p-10 flex justify-center bg-slate-50/30">
              {(() => {
                const count = userData.donations_count || 0;
                let medalTier: "gold" | "silver" | "bronze" = "bronze";
                let borderColor = "border-amber-750/30";
                let innerBorderColor = "border-amber-700/20";
                let sealTitle = "BRONZE";
                let bgPattern = "bg-orange-50/5";
                let textColor = "text-orange-950";

                if (count >= 6) {
                  medalTier = "gold";
                  borderColor = "border-amber-500/30";
                  innerBorderColor = "border-amber-500/20";
                  sealTitle = "OR";
                  bgPattern = "bg-amber-50/5";
                  textColor = "text-amber-950";
                } else if (count >= 3) {
                  medalTier = "silver";
                  borderColor = "border-slate-500/30";
                  innerBorderColor = "border-slate-500/20";
                  sealTitle = "ARGENT";
                  bgPattern = "bg-slate-50/5";
                  textColor = "text-slate-950";
                }

                // Configs for the small badge seal on the certificate
                const isGold = medalTier === "gold";
                const isSilver = medalTier === "silver";
                
                const medalGrad = isGold 
                  ? "url(#certGoldMedal)" 
                  : isSilver 
                    ? "url(#certSilverMedal)" 
                    : "url(#certBronzeMedal)";
                const innerGrad = isGold 
                  ? "url(#certGoldInner)" 
                  : isSilver 
                    ? "url(#certSilverInner)" 
                    : "url(#certBronzeInner)";
                
                const starLight = isGold ? "#fef08a" : isSilver ? "#f8fafc" : "#ffedd5";
                const starDark = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";
                const wreathColor = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";

                return (
                  <div id="printable-certificate" className={`relative p-8 md:p-12 mx-auto overflow-hidden bg-white text-slate-800 border-8 ${borderColor} rounded-2xl ${bgPattern} flex flex-col items-center justify-between aspect-[1.414/1] w-full max-w-[650px] shadow-lg border-double`}>
                    
                    {/* Inner Frame */}
                    <div className={`absolute inset-2 border-2 border-dashed ${innerBorderColor} rounded-lg pointer-events-none`}></div>
                    
                    {/* Corner Flourishes */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-350"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-350"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-350"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-350"></div>

                    {/* Watermark Logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                      <Droplets className="w-80 h-80 text-primary" />
                    </div>

                    {/* Header */}
                    <div className="text-center z-10">
                      <h1 className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-slate-400 font-extrabold uppercase mb-1">
                        RÉPUBLIQUE DU MAROC
                      </h1>
                      <div className="h-[1px] w-12 bg-slate-300 mx-auto mb-1"></div>
                      <h2 className="text-[8px] md:text-[10px] tracking-wider text-slate-500 font-bold uppercase">
                        CENTRE NATIONAL DE TRANSFUSION SANGUINE
                      </h2>
                    </div>

                    {/* Certificate Title */}
                    <div className="text-center my-2 z-10">
                      <h3 className="font-serif text-2xl md:text-3.5xl font-extrabold tracking-wide text-slate-900 leading-none">
                        CERTIFICAT DE GRATITUDE
                      </h3>
                      <p className="text-[10px] md:text-xs text-primary font-bold italic mt-1">
                        Pour un engagement civique exceptionnel
                      </p>
                    </div>

                    {/* Recipient Details */}
                    <div className="text-center w-full z-10 space-y-2">
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Ce certificat est fièrement décerné à
                      </p>
                      <h4 className="font-serif text-xl md:text-2.5xl font-black text-slate-800 border-b border-slate-200 pb-1 mx-auto max-w-[80%] capitalize">
                        {userData.full_name}
                      </h4>
                      <p className="text-[10px] md:text-[11px] text-slate-600 max-w-[85%] mx-auto leading-relaxed">
                        En reconnaissance de sa noble contribution au don de sang volontaire. Grâce à ses gestes généreux de solidarité nationale, il contribue directement à sauver des vies humaines.
                      </p>
                    </div>

                    {/* Stats and Seal Section */}
                    <div className="flex items-center justify-between w-full mt-4 px-4 z-10">
                      {/* Date block */}
                      <div className="text-left flex flex-col justify-end h-14 w-28 border-b border-slate-200 pb-1">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Fait le</span>
                        <span className="text-[10px] md:text-xs font-extrabold text-slate-700">
                          {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>

                      {/* Small Seal */}
                      <div className="scale-[0.8] -my-4">
                        <svg viewBox="0 0 100 120" className="w-16 h-20 select-none">
                          <defs>
                            <linearGradient id="certGoldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#fffbeb" />
                              <stop offset="25%" stopColor="#fef08a" />
                              <stop offset="50%" stopColor="#eab308" />
                              <stop offset="75%" stopColor="#ca8a04" />
                              <stop offset="100%" stopColor="#854d0e" />
                            </linearGradient>
                            <linearGradient id="certGoldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#fef9c3" />
                              <stop offset="100%" stopColor="#ca8a04" />
                            </linearGradient>
                            <linearGradient id="certSilverMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f8fafc" />
                              <stop offset="25%" stopColor="#e2e8f0" />
                              <stop offset="50%" stopColor="#cbd5e1" />
                              <stop offset="75%" stopColor="#94a3b8" />
                              <stop offset="100%" stopColor="#475569" />
                            </linearGradient>
                            <linearGradient id="certSilverInner" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#f1f5f9" />
                              <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                            <linearGradient id="certBronzeMedal" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#fff7ed" />
                              <stop offset="25%" stopColor="#ffedd5" />
                              <stop offset="50%" stopColor="#fdba74" />
                              <stop offset="75%" stopColor="#c2410c" />
                              <stop offset="100%" stopColor="#7c2d12" />
                            </linearGradient>
                            <linearGradient id="certBronzeInner" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ffedd5" />
                              <stop offset="100%" stopColor="#9a3412" />
                            </linearGradient>
                          </defs>

                          {/* Ribbons */}
                          <path d="M 40 70 L 15 110 L 38 98 L 50 70 Z" fill="url(#ribbonGrad)" stroke="#f59e0b" strokeWidth="1" />
                          <path d="M 60 70 L 85 110 L 62 98 L 50 70 Z" fill="url(#ribbonGrad)" stroke="#f59e0b" strokeWidth="1" />
                          
                          {/* Medal */}
                          <circle cx="50" cy="45" r="38" fill={medalGrad} stroke="#ffffff" strokeWidth="1" />
                          <circle cx="50" cy="45" r="31" fill={innerGrad} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
                          
                          {/* Leaves */}
                          <g fill={wreathColor} opacity="0.65">
                            <path d="M 28 35 C 25 37, 24 41, 27 44 C 29 42, 29 38, 28 35 Z" />
                            <path d="M 25 43 C 22 45, 21 49, 24 52 C 26 50, 26 46, 25 43 Z" />
                            <path d="M 72 35 C 75 37, 76 41, 73 44 C 71 42, 71 38, 72 35 Z" />
                            <path d="M 75 43 C 78 45, 79 49, 76 52 C 74 50, 74 46, 75 43 Z" />
                          </g>

                          {/* Star */}
                          <g>
                            <polygon points="50,25 50,45 46,39" fill={starLight} />
                            <polygon points="50,25 54,39 50,45" fill={starDark} />
                            <polygon points="68,39 50,45 54,39" fill={starLight} />
                            <polygon points="68,39 56,46 50,45" fill={starDark} />
                            <polygon points="61,58 50,45 56,46" fill={starLight} />
                            <polygon points="61,58 50,50 50,45" fill={starDark} />
                            <polygon points="39,58 50,45 50,50" fill={starLight} />
                            <polygon points="39,58 44,46 50,45" fill={starDark} />
                            <polygon points="32,39 50,45 44,46" fill={starLight} />
                            <polygon points="32,39 46,39 50,45" fill={starDark} />
                          </g>
                        </svg>
                        <div className="text-[7px] font-black text-center text-slate-500 uppercase tracking-widest mt-1">
                          NIVEAU {sealTitle}
                        </div>
                      </div>

                      {/* Signature block */}
                      <div className="text-right flex flex-col justify-end h-14 w-28 border-b border-slate-200 pb-1">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Le Directeur</span>
                        <span className="font-serif text-[10px] md:text-xs italic text-primary/85 font-bold">CNTS Maroc</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>

    {/* Print-only Certificate Container */}
    <div className="print-only">
      <div 
        className="print-certificate-page"
        style={{
          '--cert-border-color': borderColor,
          '--cert-border-color-alpha': `${borderColor}40`,
          '--cert-border-color-alpha2': `${borderColor}a0`,
        } as React.CSSProperties}
      >
        <div className="print-outer-border"></div>
        <div className="print-inner-border"></div>
        <div className="print-corner print-top-left"></div>
        <div className="print-corner print-top-right"></div>
        <div className="print-corner print-bottom-left"></div>
        <div className="print-corner print-bottom-right"></div>
        
        {/* Watermark Droplet SVG */}
        <svg className="print-watermark" viewBox="0 0 24 24" fill="red">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>

        {/* Header */}
        <div className="print-header">
          <h1>RÉPUBLIQUE DU MAROC</h1>
          <div className="print-divider"></div>
          <h2>CENTRE NATIONAL DE TRANSFUSION SANGUINE</h2>
        </div>

        {/* Title Section */}
        <div className="print-title-section">
          <h3>CERTIFICAT DE GRATITUDE</h3>
          <p>Pour un engagement civique exceptionnel</p>
        </div>

        {/* Recipient */}
        <div className="print-recipient-section">
          <h4 className="print-recipient-label">Ce certificat est fièrement décerné à</h4>
          <div className="print-recipient-name">{userData.full_name}</div>
          <p className="print-certificate-text">
            En reconnaissance de sa noble contribution au don de sang volontaire. Grâce à ses gestes généreux de solidarité nationale, il contribue directement à sauver des vies humaines.
          </p>
        </div>

        {/* Footer Seals and Signatures */}
        <div className="print-footer-section">
          <div className="print-sig-block" style={{ textAlign: 'left' }}>
            <span className="print-sig-label">Fait le</span>
            <span className="print-sig-val">
              {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="print-seal-container">
            <svg viewBox="0 0 100 120" style={{ width: '70px', height: '85px' }}>
              <defs>
                <linearGradient id="certRibbonGradPrint" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#991b1b" />
                  <stop offset="35%" stopColor="#dc2626" />
                  <stop offset="65%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
                <filter id="certMedalShadowPrint" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.25"/>
                </filter>
                <linearGradient id="certBronzeMedalPrint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="25%" stopColor="#ffedd5" />
                  <stop offset="50%" stopColor="#fdba74" />
                  <stop offset="75%" stopColor="#c2410c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>
                <linearGradient id="certBronzeInnerPrint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffedd5" />
                  <stop offset="100%" stopColor="#9a3412" />
                </linearGradient>
                <linearGradient id="certGoldMedalPrint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="25%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="75%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <linearGradient id="certGoldInnerPrint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
                <linearGradient id="certSilverMedalPrint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="25%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="75%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="certSilverInnerPrint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Ribbons */}
              <path d="M 40 70 L 15 110 L 38 98 L 50 70 Z" fill="url(#certRibbonGradPrint)" stroke="#f59e0b" strokeWidth="1" />
              <path d="M 60 70 L 85 110 L 62 98 L 50 70 Z" fill="url(#certRibbonGradPrint)" stroke="#f59e0b" strokeWidth="1" />
              
              {/* Medal Base */}
              <circle cx="50" cy="45" r="38" fill={medalGradSelected} stroke="#ffffff" strokeWidth="1" filter="url(#certMedalShadowPrint)" />
              <circle cx="50" cy="45" r="31" fill={innerGradSelected} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              
              {/* Leaves */}
              <g fill={wreathColor} opacity="0.65">
                <path d="M 28 35 C 25 37, 24 41, 27 44 C 29 42, 29 38, 28 35 Z" />
                <path d="M 25 43 C 22 45, 21 49, 24 52 C 26 50, 26 46, 25 43 Z" />
                <path d="M 72 35 C 75 37, 76 41, 73 44 C 71 42, 71 38, 72 35 Z" />
                <path d="M 75 43 C 78 45, 79 49, 76 52 C 74 50, 74 46, 75 43 Z" />
              </g>

              {/* Star */}
              <g>
                <polygon points="50,25 50,45 46,39" fill={starLight} />
                <polygon points="50,25 54,39 50,45" fill={starDark} />
                <polygon points="68,39 50,45 54,39" fill={starLight} />
                <polygon points="68,39 56,46 50,45" fill={starDark} />
                <polygon points="61,58 50,45 56,46" fill={starLight} />
                <polygon points="61,58 50,50 50,45" fill={starDark} />
                <polygon points="39,58 50,45 50,50" fill={starLight} />
                <polygon points="39,58 44,46 50,45" fill={starDark} />
                <polygon points="32,39 50,45 44,46" fill={starLight} />
                <polygon points="32,39 46,39 50,45" fill={starDark} />
              </g>
            </svg>
            <div className="print-seal-label">NIVEAU {sealTitle}</div>
          </div>

          <div className="print-sig-block" style={{ textAlign: 'right' }}>
            <span className="print-sig-label">Le Directeur</span>
            <span className="print-sig-val italic">CNTS Maroc</span>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
