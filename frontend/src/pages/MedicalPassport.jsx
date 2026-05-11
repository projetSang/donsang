import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HealthCard } from "@/components/HealthCard";
import { Button } from "@/components/ui/button";
import { 
  Droplets, 
  PhoneCall, 
  ShieldAlert, 
  Dna, 
  Activity, 
  QrCode,
  Share2,
  FileText,
  Plus
} from "lucide-react";

export default function MedicalPassport() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      
      <main className="container mx-auto px-4 pb-16 md:pt-32 md:pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-reveal">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3 w-3" />
              Passeport Médical
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Mon Dossier <span className="text-primary">Vital</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Toutes vos informations essentielles réunies en un seul endroit pour une prise en charge rapide et sécurisée.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-2">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="hero" className="rounded-xl px-6">
              <QrCode className="h-4 w-4 mr-2" />
              Mon QR Code
            </Button>
          </div>
        </div>

        {/* Logical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood group matching the user's image request */}
          <HealthCard 
            icon={Droplets}
            title="Groupe sanguin"
            description="Enregistrez votre groupe sanguin ABO + Rh pour un accès rapide en cas d'urgence. Vos données sont toujours à jour."
            value="A+"
          />

          <HealthCard 
            icon={PhoneCall}
            title="Contact d'urgence"
            description="La personne à contacter immédiatement en cas d'incident. Assurez-vous que ces coordonnées sont valides."
            value="Hassania"
          />

          <HealthCard 
            icon={ShieldAlert}
            title="Allergies & Alertes"
            description="Signalez toute allergie médicamenteuse ou alimentaire critique pour votre sécurité lors des soins."
            value="Pénicilline"
          />

          <HealthCard 
            icon={Dna}
            title="Maladies chroniques"
            description="Informations sur vos conditions de santé à long terme nécessitant un suivi particulier."
          />

          <HealthCard 
            icon={Activity}
            title="Derniers Examens"
            description="Historique de vos dernières analyses sanguines et bilans de santé effectués."
          />

          <div className="bg-dashed border-2 border-dashed border-border rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Ajouter une section</h3>
            <p className="text-muted-foreground text-sm">Personnalisez votre passeport médical</p>
          </div>
        </div>

        {/* Recent Activity Section (The Logical part) */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Historique des dons
            </h2>
            <Button variant="ghost" className="text-primary font-bold">Voir tout</Button>
          </div>
          
          <div className="bg-white rounded-xl  border border-border overflow-hidden shadow-sm">
            <div className="divide-y divide-border">
              {[
                { date: "12 Mars 2026", loc: "Hôpital Ibn Sina, Rabat", type: "Don de Sang", status: "Terminé" },
                { date: "05 Janvier 2026", loc: "Centre de Transfusion, Casa", type: "Don de Plaquettes", status: "Terminé" }
              ].map((item, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">{item.type}</div>
                      <div className="text-sm text-muted-foreground">{item.loc}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-foreground">{item.date}</div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}