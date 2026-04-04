import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Droplets, FileText, Share2, Search, Bell, Shield
} from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Groupe sanguin",
    description: "Enregistrez votre groupe sanguin ABO + Rh pour un accès rapide en cas d'urgence. Vos données sont toujours à jour et accessibles par vos médecins.",
  },
  {
    icon: FileText,
    title: "Dossier médical complet",
    description: "Conservez vos informations médicales, allergies, traitements et documents en un seul endroit sécurisé. Plus besoin de transporter vos papiers.",
  },
  {
    icon: Share2,
    title: "Lien de partage sécurisé",
    description: "Générez un lien unique pour que votre médecin consulte votre dossier en lecture seule. Vous gardez le contrôle total sur l'accès.",
  },
  {
    icon: Search,
    title: "Recherche de donneurs",
    description: "Les hôpitaux trouvent des donneurs compatibles par groupe sanguin et proximité géographique en quelques secondes.",
  },
  {
    icon: Bell,
    title: "Alertes d'urgence",
    description: "Recevez des notifications quand un hôpital proche a besoin de votre groupe sanguin. Répondez en un clic.",
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Vos données médicales sont chiffrées et protégées selon les normes de confidentialité les plus strictes (GDPR-like).",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              Nos <span className="text-gradient">fonctionnalités</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos informations médicales et faciliter le don de sang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
