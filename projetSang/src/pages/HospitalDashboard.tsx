import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart, Search, Users, Droplets, Building2,
  LogOut, Bell, BarChart3, ChevronRight, LayoutDashboard,
  Settings, HelpCircle, Mail
} from "lucide-react";

import { PatientsTab } from "@/components/hospital/PatientsTab";
import { SearchTab } from "@/components/hospital/SearchTab";
import { StatsTab } from "@/components/hospital/StatsTab";
import { AlertsTab } from "@/components/hospital/AlertsTab";
import { SettingsTab } from "@/components/hospital/SettingsTab";
import { MessagesTab } from "@/components/hospital/MessagesTab";
import TableBord from "@/components/hospital/TableBord";

const tabs = [
  { id: "table", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "patients", label: "Gestion Patients", icon: Users },
  { id: "search", label: "Recherche Donneurs", icon: Search },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "alerts", label: "Alertes Urgence", icon: Bell },
  { id: "messages", label: "Messages Reçus", icon: Mail },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("table");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState("");
  const [city, setCity] = useState("");
  const [hospitalInfo, setHospitalInfo] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/hospital/settings")
      .then(res => res.json())
      .then(data => setHospitalInfo(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center px-6 md:px-12 relative z-10">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="logo_sang.png" alt="" width={130} height={130} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{hospitalInfo?.name?.toUpperCase() || "Chargement..."}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-right">
                {hospitalInfo?.city || "Centre Hospitalier"}
              </span>
            </div>
            <div className="h-10 w-10 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-bold border-2 border-white">
              {hospitalInfo?.name ? hospitalInfo.name.charAt(0).toUpperCase() : "H"}
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-sm sticky top-24">
              <div className="px-4 py-3 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</p>
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

              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support & Config</p>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${activeTab === "settings"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                >
                  <Settings className={`h-5 w-5 ${activeTab === "settings" ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                  Paramètres
                </button>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0 space-y-8">


            <div className="min-h-[500px]">
              {activeTab === "table" && <TableBord />}
              {activeTab === "patients" && <PatientsTab showAddPatient={showAddPatient} setShowAddPatient={setShowAddPatient} />}
              {activeTab === "search" && <SearchTab selectedBlood={selectedBlood} setSelectedBlood={setSelectedBlood} city={city} setCity={setCity} />}
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
