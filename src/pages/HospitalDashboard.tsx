import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Heart, Search, Users, Droplets, Building2, 
  LogOut, Bell, BarChart3, ChevronRight, LayoutDashboard,
  Settings, HelpCircle
} from "lucide-react";

import { PatientsTab } from "@/components/hospital/PatientsTab";
import { SearchTab, mockDonors } from "@/components/hospital/SearchTab";
import { StatsTab } from "@/components/hospital/StatsTab";
import { ContactsTab } from "@/components/hospital/ContactsTab";
import { AlertsTab } from "@/components/hospital/AlertsTab";

const stats = [
  { label: "Donneurs dans la région", value: "1,247", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Demandes ce mois", value: "38", icon: Search, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Contacts établis", value: "156", icon: Heart, color: "text-primary", bg: "bg-primary/5" },
  { label: "Stocks critiques", value: "2/8", icon: Droplets, color: "text-orange-500", bg: "bg-orange-50" },
];

const tabs = [
  { id: "patients", label: "Gestion Patients", icon: Users },
  { id: "search", label: "Recherche Donneurs", icon: Search },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "contacts", label: "Hôpitaux Partenaires", icon: Building2 },
  { id: "alerts", label: "Alertes Urgence", icon: Bell },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("patients");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState("O+");
  const [city, setCity] = useState("Casablanca");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Sang<span className="text-primary">Vital</span> <span className="text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded ml-1 font-black text-slate-500">Admin</span></span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">CHU Casablanca</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-right">Centre Hospitalier Universitaire</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 transition-colors hover:bg-slate-200 cursor-pointer">
              <Bell className="h-5 w-5" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-bold border-2 border-white">
              H
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeTab === tab.id
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
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all group">
                  <Settings className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                  Paramètres
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all group">
                  <HelpCircle className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                  Aide & Support
                </button>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0 space-y-8">
            <div className="animate-reveal">
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Tableau de Bord
              </h1>
              <p className="text-slate-500 mt-1">Bienvenue, CHU Casablanca. Voici l'état actuel de votre hôpital.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${s.bg} ${s.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</div>
                  <div className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wide text-[10px] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="min-h-[500px]">
              {activeTab === "patients" && <PatientsTab showAddPatient={showAddPatient} setShowAddPatient={setShowAddPatient} />}
              {activeTab === "search" && <SearchTab selectedBlood={selectedBlood} setSelectedBlood={setSelectedBlood} city={city} setCity={setCity} />}
              {activeTab === "stats" && <StatsTab />}
              {activeTab === "contacts" && <ContactsTab mockDonors={mockDonors} />}
              {activeTab === "alerts" && <AlertsTab showNewAlert={showNewAlert} setShowNewAlert={setShowNewAlert} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

