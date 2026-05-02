import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Heart, User, Droplets, FileText, Share2, Bell, Settings,
  Plus, Copy, RefreshCw, Download, Upload, AlertTriangle,
  Phone, MapPin, LogOut, ChevronRight
} from "lucide-react";

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

const mockDocuments = [
  { name: "Analyse sanguine - Mars 2026", type: "PDF", date: "15/03/2026", category: "Analyses" },
  { name: "Radiographie thorax", type: "Image", date: "02/02/2026", category: "Imagerie" },
  { name: "Ordonnance Dr. Bennani", type: "PDF", date: "20/01/2026", category: "Ordonnances" },
];

const tabs = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "medical", label: "Dossier médical", icon: FileText },
  { id: "documents", label: "Documents", icon: Download },
  { id: "share", label: "Partage", icon: Share2 },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [shareLink] = useState("https://sangvital.ma/dossier/abc123xyz");

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar user={{ name: "Aya Asrir" }} />

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

          {/* Blood group card */}
          <div className="bg-card rounded-xl border border-border p-4 mt-4 text-center">
            <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">O+</div>
            <div className="text-xs text-muted-foreground mt-1">Votre groupe sanguin</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Mon profil</h2>
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                    <Input defaultValue="Aya Asrir" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input defaultValue="aya@email.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <Input defaultValue="+212 600 123 456" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ville</label>
                    <Input defaultValue="Casablanca" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                    <Input type="date" defaultValue="1998-05-15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Groupe sanguin</label>
                    <select 
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue="O+"
                    >
                      {bloodGroups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button variant="hero" className="mt-4">Enregistrer les modifications</Button>
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
            </div>
          )}

          {activeTab === "medical" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dossier médical</h2>
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maladies chroniques</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    defaultValue="Aucune"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    defaultValue="Pénicilline"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Traitements en cours</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    defaultValue="Aucun"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Antécédents médicaux</label>
                  <textarea
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    defaultValue="Appendicectomie (2019)"
                  />
                </div>
                <Button variant="hero">Enregistrer</Button>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Documents médicaux</h2>
                <Button variant="hero" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </div>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {mockDocuments.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.category} • {doc.date}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "share" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Partager mon dossier</h2>
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Générez un lien sécurisé pour permettre à votre médecin de consulter votre dossier en lecture seule.
                </p>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-1 font-mono text-xs" />
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Régénérer le lien
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Désactiver le lien
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <div className="font-medium mb-1">Paramètres du lien</div>
                  <div className="text-muted-foreground">Durée de validité : 30 jours</div>
                  <div className="text-muted-foreground">Accès : Lecture seule</div>
                  <div className="text-muted-foreground">Statut : Actif</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Notifications</h2>
              <div className="space-y-3">
                {[
                  { title: "Urgence : Besoin de donneur O+ à Casablanca", time: "Il y a 2h", urgent: true },
                  { title: "Votre dossier a été consulté par Dr. Bennani", time: "Hier", urgent: false },
                  { title: "Rappel : Mettez à jour vos informations médicales", time: "Il y a 3 jours", urgent: false },
                ].map((n, i) => (
                  <div key={i} className={`bg-card rounded-xl border p-4 flex items-start gap-3 ${n.urgent ? "border-primary" : "border-border"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.urgent ? "hero-gradient text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                    </div>
                    {n.urgent && (
                      <div className="flex gap-2">
                        <Button variant="hero" size="sm">Disponible</Button>
                        <Button variant="outline" size="sm">Indisponible</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
