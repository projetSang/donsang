import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Heart, UserPlus, ClipboardList, Link2, ArrowRight, Droplets, MapPin, Phone,
  FileText, Share2, Search, Bell, Shield
} from "lucide-react";



const steps = [
  {
    icon: UserPlus,
    title: "Connectez-vous",
    description: "Accédez à votre espace sécurisé avec vos identifiants fournis.",
  },
  {
    icon: ClipboardList,
    title: "Remplissez votre dossier",
    description: "Ajoutez votre groupe sanguin, vos informations médicales et documents.",
  },
  {
    icon: Link2,
    title: "Partagez avec vos médecins",
    description: "Générez un lien sécurisé pour donner accès à votre dossier.",
  },
];

const stats = [
  { value: "8", label: "Groupes sanguins" },
  { value: "24/7", label: "Accès continu" },
  { value: "100%", label: "Données sécurisées" },
  { value: "< 1min", label: "Recherche de donneurs" },
];

const features = [
  {
    icon: Droplets,
    title: "Groupe sanguin",
    description: "Enregistrez votre groupe sanguin ABO + Rh pour un accès rapide en cas d'urgence.",
  },
  {
    icon: FileText,
    title: "Dossier médical complet",
    description: "Conservez vos informations médicales, allergies et traitements en un seul endroit sécurisé.",
  },
  {
    icon: Share2,
    title: "Lien de partage sécurisé",
    description: "Générez un lien unique pour que votre médecin consulte votre dossier en lecture seule.",
  },
  {
    icon: Search,
    title: "Recherche de donneurs",
    description: "Les hôpitaux trouvent des donneurs compatibles par groupe sanguin et proximité en quelques secondes.",
  },
  {
    icon: Bell,
    title: "Alertes d'urgence",
    description: "Recevez des notifications quand un hôpital proche a besoin de votre groupe sanguin.",
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Vos données médicales sont chiffrées et protégées selon les normes de confidentialité locales.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Heart className="h-4 w-4" />
            Sauvez des vies, partagez votre groupe sanguin
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
            Votre dossier médical{" "}
            <span className="text-gradient">toujours accessible</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Sauvegardez votre groupe sanguin et vos informations médicales. Partagez-les facilement avec vos médecins et aidez les hôpitaux à trouver des donneurs en urgence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link to="/login">
              <Button variant="hero-outline" size="lg" className="text-base px-8">
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              En 3 étapes simples, accédez à un espace médical sécurisé.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="h-16 w-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-4 text-primary-foreground text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Fonctionnalités</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos informations médicales et faciliter le don de sang.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-transform hover:-translate-y-1 duration-300"
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

      {/* CTA for hospitals */}
      <section className="py-16 md:py-24 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Vous êtes un hôpital ?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
            Accédez à une base de données de donneurs classés par groupe sanguin et proximité. Trouvez des donneurs compatibles en quelques secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link to="/contact">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8">
                <Phone className="mr-2 h-5 w-5 text-white" />
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
