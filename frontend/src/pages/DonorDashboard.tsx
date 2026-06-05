import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  User, Droplets, FileText, Share2, Bell, RefreshCw, Crown, Award, Printer, Download, Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDonorData } from "@/hooks/useDonorData";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import sub-components
import { ProfileTab } from "@/components/donor/ProfileTab";
import { NotificationsTab } from "@/components/donor/NotificationsTab";
import { AppointmentsTab } from "@/components/donor/AppointmentsTab";

export default function DonorDashboard() {
  const { user: userData, updateUser, loading: authLoading, logout } = useAuth();
  const { t, lang, isRtl } = useLanguage();
  const dashboardT = t.donorDashboard;

  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: dashboardT.profile, icon: User },
    { id: "appointments", label: dashboardT.appointments, icon: Calendar },
    { id: "certificate", label: dashboardT.certificate, icon: Award },
    { id: "notifications", label: dashboardT.notifications, icon: Bell },
  ];

  const {
    notifications,
    respondToAlert: handleAvailabilityResponse
  } = useDonorData(userData, authLoading, logout);

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
        address: userData.city || userData.address || "",
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
          user_type: "donor"
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passwords.new !== passwords.confirm) {
      setPassError(dashboardT.passwordMismatch);
      return;
    }

    setPassLoading(true);
    try {
      const data = await apiFetch("/update-password", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          user_type: "donor",
          current_password: passwords.current,
          new_password: passwords.new
        }),
      });

      if (data.status === "success") {
        setPassSuccess(data.message);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setPassError(data.message || dashboardT.updateError);
      }
    } catch (err: any) {
      setPassError(err.message || dashboardT.connError);
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
          user_type: "donor"
        }),
      });

      if (data.status === "success") {
        setProfileSuccess(data.message);
        updateUser(data.user);
      } else {
        setProfileError(data.message || dashboardT.updateError);
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileError(err.message || dashboardT.connError);
    } finally {
      setProfileLoading(false);
    }
  };

  const { userName } = useParams();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">{dashboardT.loadingProfile}</p>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const expectedSlug = slugify(userData.full_name || userData.name || "donor");
  if (userName !== expectedSlug) {
    return <Navigate to={`/Donsang/Donneur/${expectedSlug}`} replace />;
  }
  const count = userData.donations_count || 0;
  let sealTitle = "BRONZE";
  let sealText = dashboardT.bronzeBadge;
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
    sealText = dashboardT.goldBadge;
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
    sealText = dashboardT.silverBadge;
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
      <div className="no-print min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar />

      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-18 md:top-16 z-40 bg-white border-b border-border shadow-sm">
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
              <div className="text-xs text-muted-foreground mt-1">{dashboardT.yourBloodType}</div>
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
                    <div className="text-xs text-slate-500 font-bold mt-1">{dashboardT.donationsCount}</div>
                  </div>
                );
              }

              // Define tier properties for Gold, Silver, and Bronze
              let tier: "gold" | "silver" | "bronze" = "bronze";
              let title = dashboardT.bronzeBadge;
              let bgGlow = "from-orange-50/60 to-white border-orange-200/80";
              let countTextClass = "text-orange-850";
              let numColor = "text-orange-700";
              let labelText = dashboardT.bronzeDonor;

              if (count >= 6) {
                tier = "gold";
                title = dashboardT.goldBadge;
                bgGlow = "from-amber-50/60 to-white border-amber-200/80";
                countTextClass = "text-amber-850";
                numColor = "text-amber-700";
                labelText = dashboardT.goldDonor;
              } else if (count >= 3) {
                tier = "silver";
                title = dashboardT.silverBadge;
                bgGlow = "from-slate-50/60 to-white border-slate-200/80";
                countTextClass = "text-slate-850";
                numColor = "text-slate-700";
                labelText = dashboardT.silverDonor;
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
                <button type="button" 
                  onClick={() => setActiveTab("certificate")}
                  className={`bg-gradient-to-br ${bgGlow} rounded-xl border p-4 text-center shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-amber-300 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                  title={dashboardT.viewMyCert}
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
                        {/* Point Haut */}
                        <polygon points="50,25 50,45 46,39" fill={starLight} />
                        <polygon points="50,25 54,39 50,45" fill={starDark} />
                        
                        {/* Point Droite */}
                        <polygon points="68,39 50,45 54,39" fill={starLight} />
                        <polygon points="68,39 56,46 50,45" fill={starDark} />
                        
                        {/* Point Bas Droite */}
                        <polygon points="61,58 50,45 56,46" fill={starLight} />
                        <polygon points="61,58 50,50 50,45" fill={starDark} />
                        
                        {/* Point Bas Gauche */}
                        <polygon points="39,58 50,45 50,50" fill={starLight} />
                        <polygon points="39,58 44,46 50,45" fill={starDark} />
                        
                        {/* Point Gauche */}
                        <polygon points="32,39 50,45 44,46" fill={starLight} />
                        <polygon points="32,39 46,39 50,45" fill={starDark} />
                      </g>
                    </svg>
                  </div>
                  <div className={`text-xl font-black ${numColor}`}>{title}</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1">{count} {count > 1 ? dashboardT.donations : dashboardT.donation}</div>
                  <div className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{labelText}</div>
                </button>
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
              onViewCertificate={() => setActiveTab("certificate")}
            />
          )}

          {activeTab === "certificate" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] space-y-6 flex flex-col items-center">
              {/* Header Actions */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{dashboardT.myHonorCert}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{dashboardT.certSubtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer className="h-4 w-4" />
                  {dashboardT.printPdf}
                </button>
              </div>

              {/* Certificate Template */}
              <div className="w-full overflow-x-auto flex justify-center py-6 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                {(() => {
                  const count = userData.donations_count || 0;
                  let medalTier: "gold" | "silver" | "bronze" = "bronze";
                  let borderColor = "border-amber-750/30";
                  let innerBorderColor = "border-amber-700/20";
                  let bgPattern = "bg-orange-50/5";

                  if (count >= 6) {
                    medalTier = "gold";
                    borderColor = "border-amber-500/30";
                    innerBorderColor = "border-amber-500/20";
                    bgPattern = "bg-amber-50/5";
                  } else if (count >= 3) {
                    medalTier = "silver";
                    borderColor = "border-slate-500/30";
                    innerBorderColor = "border-slate-500/20";
                    bgPattern = "bg-slate-50/5";
                  }

                  const isGold = medalTier === "gold";
                  const isSilver = medalTier === "silver";
                  
                  const medalGrad = isGold ? "url(#certGoldMedal)" : isSilver ? "url(#certSilverMedal)" : "url(#certBronzeMedal)";
                  const innerGrad = isGold ? "url(#certGoldInner)" : isSilver ? "url(#certSilverInner)" : "url(#certBronzeInner)";
                  
                  const starLight = isGold ? "#fef08a" : isSilver ? "#f8fafc" : "#ffedd5";
                  const starDark = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";
                  const wreathColor = isGold ? "#ca8a04" : isSilver ? "#64748b" : "#9a3412";

                  return (
                    <div id="printable-certificate" className={`relative p-8 md:p-12 mx-auto overflow-hidden bg-white text-slate-800 border-8 ${borderColor} rounded-2xl ${bgPattern} flex flex-col items-center justify-between aspect-[1.414/1] w-full max-w-[650px] shadow-lg border-double`}>
                      <div className={`absolute inset-2 border-2 border-dashed ${innerBorderColor} rounded-lg pointer-events-none`}></div>
                      
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-350"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-350"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-350"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-350"></div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <Droplets className="w-80 h-80 text-primary" />
                      </div>

                      <div className="text-center z-10">
                        <h1 className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-slate-400 font-extrabold uppercase mb-1">
                          {dashboardT.republicMorocco}
                        </h1>
                        <div className="h-[1px] w-12 bg-slate-300 mx-auto mb-1"></div>
                        <h2 className="text-[8px] md:text-[10px] tracking-wider text-slate-500 font-bold uppercase">
                          {dashboardT.cntsTitle}
                        </h2>
                      </div>

                      <div className="text-center my-2 z-10">
                        <h3 className="font-serif text-2xl md:text-3.5xl font-extrabold tracking-wide text-slate-900 leading-none">
                          {dashboardT.certGratitude}
                        </h3>
                        <p className="text-[10px] md:text-xs text-primary font-bold italic mt-1">
                          {dashboardT.civicEngagement}
                        </p>
                      </div>

                      <div className="text-center w-full z-10 space-y-2">
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {dashboardT.proudlyAwarded}
                        </p>
                        <h4 className="font-serif text-xl md:text-2.5xl font-black text-slate-800 border-b border-slate-200 pb-1 mx-auto max-w-[80%] capitalize">
                          {userData.full_name}
                        </h4>
                        <p className="text-[10px] md:text-[11px] text-slate-600 max-w-[85%] mx-auto leading-relaxed">
                          {dashboardT.recognitionText}
                        </p>
                      </div>

                      <div className="flex items-center justify-between w-full mt-4 px-4 z-10">
                        <div className="text-left flex flex-col justify-end h-14 w-32 border-b border-slate-200 pb-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase">{dashboardT.doneOn}</span>
                          <span className="text-[10px] md:text-xs font-extrabold text-slate-700">
                            {new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>

                        <div className="scale-[0.8] -my-4 flex flex-col items-center">
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

                            <path d="M 40 70 L 15 110 L 38 98 L 50 70 Z" fill="url(#ribbonGrad)" stroke="#f59e0b" strokeWidth="1" />
                            <path d="M 60 70 L 85 110 L 62 98 L 50 70 Z" fill="url(#ribbonGrad)" stroke="#f59e0b" strokeWidth="1" />
                            
                            <circle cx="50" cy="45" r="38" fill={medalGrad} stroke="#ffffff" strokeWidth="1" />
                            <circle cx="50" cy="45" r="31" fill={innerGrad} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
                            
                            <g fill={wreathColor} opacity="0.65">
                              <path d="M 28 35 C 25 37, 24 41, 27 44 C 29 42, 29 38, 28 35 Z" />
                              <path d="M 25 43 C 22 45, 21 49, 24 52 C 26 50, 26 46, 25 43 Z" />
                              <path d="M 72 35 C 75 37, 76 41, 73 44 C 71 42, 71 38, 72 35 Z" />
                              <path d="M 75 43 C 78 45, 79 49, 76 52 C 74 50, 74 46, 75 43 Z" />
                            </g>

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
                            {dashboardT.level} {sealText}
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-end h-14 w-28 border-b border-slate-200 pb-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase">{dashboardT.director}</span>
                          <span className="font-serif text-[10px] md:text-xs italic text-primary/85 font-bold">{dashboardT.cntsMaroc}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <AppointmentsTab donorId={userData.id} />
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

    {/* Print-only Certificate Container */}
    <div className="print-only">
      <div className={`print-certificate-page cert-${sealTitle.toLowerCase()}`}>
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
          <h1>{dashboardT.republicMorocco}</h1>
          <div className="print-divider"></div>
          <h2>{dashboardT.cntsTitle}</h2>
        </div>

        {/* Title Section */}
        <div className="print-title-section">
          <h3>{dashboardT.certGratitude}</h3>
          <p>{dashboardT.civicEngagement}</p>
        </div>

        {/* Recipient */}
        <div className="print-recipient-section">
          <h4 className="print-recipient-label">{dashboardT.proudlyAwarded}</h4>
          <div className="print-recipient-name">{userData.full_name}</div>
          <p className="print-certificate-text">
            {dashboardT.recognitionText}
          </p>
        </div>

        {/* Footer Seals and Signatures */}
        <div className="print-footer-section flex items-center justify-between">
          <div className="print-sig-block text-left">
            <span className="print-sig-label">{dashboardT.doneOn}</span>
            <span className="print-sig-val">
              {new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="print-seal-container flex flex-col items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-[70px] h-[85px]">
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
            <div className="print-seal-label">{dashboardT.level} {sealText}</div>
          </div>

          <div className="print-sig-block text-right">
            <span className="print-sig-label">{dashboardT.director}</span>
            <span className="print-sig-val italic">{dashboardT.cntsMaroc}</span>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
