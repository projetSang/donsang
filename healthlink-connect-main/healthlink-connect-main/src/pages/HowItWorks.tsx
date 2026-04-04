import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserPlus, ClipboardList, Link2, Share2, Search, Bell } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques secondes avec votre email, téléphone ou compte Google/Apple.",
  },
  {
    icon: ClipboardList,
    title: "Remplissez votre dossier",
    description: "Ajoutez votre groupe sanguin, vos informations médicales, allergies, traitements et documents.",
  },
  {
    icon: Link2,
    title: "Générez un lien de partage",
    description: "Créez un lien sécurisé unique pour donner accès en lecture seule à votre dossier médical.",
  },
  {
    icon: Share2,
    title: "Partagez avec vos médecins",
    description: "Envoyez le lien à votre médecin pour qu'il consulte votre dossier sans refaire d'analyses.",
  },
  {
    icon: Search,
    title: "Soyez trouvé en cas d'urgence",
    description: "Les hôpitaux peuvent vous localiser si votre groupe sanguin est recherché dans votre région.",
  },
  {
    icon: Bell,
    title: "Recevez des alertes",
    description: "Soyez notifié quand un hôpital proche a besoin de donneurs de votre groupe sanguin.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              Comment <span className="text-gradient">ça marche</span> ?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En quelques étapes simples, accédez à un espace médical sécurisé et contribuez à sauver des vies.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-6 items-start">
                <div className="shrink-0">
                  <div className="h-14 w-14 rounded-full hero-gradient flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mx-auto mt-2" />
                  )}
                </div>
                <div className="bg-card rounded-xl border border-border p-6 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
