import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart, Search, MapPin, Phone, Mail, Filter,
  Users, Droplets, Activity, Building2, LogOut, Bell, BarChart3
} from "lucide-react";

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

const mockDonors = [
  { name: "Ahmed Bouzid", age: 28, blood: "O+", city: "Casablanca", distance: "2.3 km", phone: "+212 600 111 222", verified: true },
  { name: "Fatima Zahra", age: 35, blood: "O+", city: "Casablanca", distance: "4.1 km", phone: "+212 600 333 444", verified: true },
  { name: "Youssef Amrani", age: 42, blood: "O+", city: "Mohammedia", distance: "12 km", phone: "+212 600 555 666", verified: false },
  { name: "Salma Idrissi", age: 24, blood: "O+", city: "Casablanca", distance: "5.8 km", phone: "+212 600 777 888", verified: true },
  { name: "Karim Tazi", age: 31, blood: "O+", city: "Casablanca", distance: "8.2 km", phone: "+212 600 999 000", verified: true },
];

const stats = [
  { label: "Donneurs dans la région", value: "1,247", icon: Users, color: "text-primary" },
  { label: "Recherches ce mois", value: "38", icon: Search, color: "text-info" },
  { label: "Contacts établis", value: "156", icon: Phone, color: "text-success" },
  { label: "Groupes disponibles", value: "8/8", icon: Droplets, color: "text-warning" },
];

const tabs = [
  { id: "search", label: "Recherche donneurs", icon: Search },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "contacts", label: "Contacts récents", icon: Phone },
  { id: "alerts", label: "Alertes urgence", icon: Bell },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("search");
  const [selectedBlood, setSelectedBlood] = useState("O+");
  const [city, setCity] = useState("Casablanca");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span>Sang<span className="text-primary">Vital</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">CHU Casablanca</span>
            <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-background text-sm font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card rounded-xl border border-border p-4 space-y-1">
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
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {activeTab === "search" && (
            <>
              {/* Search filters */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Recherche de donneurs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Groupe sanguin</label>
                    <select
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedBlood}
                      onChange={(e) => setSelectedBlood(e.target.value)}
                    >
                      {bloodGroups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ville</label>
                    <Input className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Distance max</label>
                    <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>5 km</option>
                      <option>10 km</option>
                      <option selected>20 km</option>
                      <option>50 km</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="hero" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {mockDonors.length} donneurs {selectedBlood} trouvés
                  </h3>
                  <span className="text-sm text-muted-foreground">Triés par distance</span>
                </div>
                <div className="space-y-3">
                  {mockDonors.map((donor, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-lg">
                          {donor.blood}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {donor.name}
                            {donor.verified && (
                              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Vérifié</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                            <span>{donor.age} ans</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {donor.city} • {donor.distance}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="hero" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Contacter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "stats" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-6">Statistiques des donneurs par groupe sanguin</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { group: "O+", count: 423, pct: 34 },
                  { group: "A+", count: 312, pct: 25 },
                  { group: "B+", count: 187, pct: 15 },
                  { group: "AB+", count: 98, pct: 8 },
                  { group: "O−", count: 87, pct: 7 },
                  { group: "A−", count: 62, pct: 5 },
                  { group: "B−", count: 49, pct: 4 },
                  { group: "AB−", count: 29, pct: 2 },
                ].map((item) => (
                  <div key={item.group} className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{item.group}</div>
                    <div className="text-lg font-semibold mt-1">{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.pct}% du total</div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full hero-gradient rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              <div className="p-4 font-semibold">Contacts récents</div>
              {mockDonors.slice(0, 3).map((d, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-sm text-muted-foreground">{d.blood} • Contacté le {["01/04/2026", "28/03/2026", "25/03/2026"][i]}</div>
                  </div>
                  <Button variant="outline" size="sm">Recontacter</Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Alertes d'urgence</h3>
                <Button variant="hero" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Nouvelle alerte
                </Button>
              </div>
              <div className="bg-card rounded-xl border border-primary p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full hero-gradient flex items-center justify-center text-primary-foreground shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Besoin urgent : Donneur O+ à Casablanca</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Envoyée il y a 2h • 12 personnes notifiées • 3 réponses positives
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Voir les réponses</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Clôturer</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
