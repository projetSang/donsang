import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart, Search, Users, Droplets, Building2,
  LogOut, Bell, BarChart3, ChevronRight, LayoutDashboard,
  Settings, HelpCircle, Mail, MessageSquare, Calendar
} from "lucide-react";

import { SearchTab } from "@/components/hospital/SearchTab";
import { StatsTab } from "@/components/hospital/StatsTab";
import { AlertsTab } from "@/components/hospital/AlertsTab";
import { SettingsTab } from "@/components/hospital/SettingsTab";
import TableBord from "@/components/hospital/TableBord";
import { MessagesTab } from "@/components/hospital/MessagesTab";
import { AppointmentsTab } from "@/components/hospital/AppointmentsTab";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HospitalDashboard() {
  const { user: hospitalInfo, logout, loading: authLoading } = useAuth();
  const { hospitalName } = useParams();
  const [activeTab, setActiveTab] = useState("table");
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState("");
  const [city, setCity] = useState("");
  const { t } = useLanguage();

  const tabs = [
    { id: "table", label: t.hospitalDashboard.dashboard, icon: LayoutDashboard },
    { id: "search", label: t.hospitalDashboard.searchDonors, icon: Search },
    { id: "appointments", label: t.hospitalDashboard.appointments, icon: Calendar },
    { id: "stats", label: t.hospitalDashboard.statistics, icon: BarChart3 },
    { id: "alerts", label: t.hospitalDashboard.urgentAlerts, icon: Bell },
    { id: "messages", label: t.hospitalDashboard.messages, icon: MessageSquare },
    { id: "settings", label: t.hospitalDashboard.settings, icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Droplets className="h-8 w-8 text-primary animate-bounce" />
      </div>
    );
  }

  if (!hospitalInfo) {
    return <Navigate to="/login" replace />;
  }

  const expectedSlug = slugify(hospitalInfo.name || "");
  if (hospitalName !== expectedSlug) {
    return <Navigate to={`/Donsang/${expectedSlug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center px-6 md:px-12 relative z-10">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo_login.png" alt="" width={130} height={130} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{hospitalInfo?.name?.toUpperCase() || t.hospitalDashboard.loading}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-right">
                {hospitalInfo?.city || t.hospitalDashboard.hospitalCenter}
              </span>
            </div>
            <div className="h-10 w-10 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-bold border-2 border-white">
              {hospitalInfo?.name ? hospitalInfo.name.charAt(0).toUpperCase() : "H"}
            </div>


            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>

          </div>
        </div>
      </header>

      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-2 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-slate-600 bg-slate-50/80 hover:bg-slate-100"}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-sm sticky top-24">
              <div className="px-4 py-3 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.hospitalDashboard.mainMenu}</p>
              </div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4 opacity-70" />}
                </button>
              ))}

            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0 space-y-8">


            <div className="min-h-[500px]">
              {activeTab === "table" && <TableBord />}
              {activeTab === "search" && <SearchTab selectedBlood={selectedBlood} setSelectedBlood={setSelectedBlood} city={city} setCity={setCity} />}
              {activeTab === "appointments" && <AppointmentsTab hospitalId={hospitalInfo.id} />}
              {activeTab === "stats" && <StatsTab />}
              {activeTab === "alerts" && (
                <AlertsTab
                  showNewAlert={showNewAlert}
                  setShowNewAlert={setShowNewAlert}
                  onViewDonors={(bloodType: string) => {
                    setSelectedBlood(bloodType);
                    setActiveTab("search");
                  }}
                />
              )}
              {activeTab === "messages" && <MessagesTab />}
              {activeTab === "settings" && <SettingsTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
