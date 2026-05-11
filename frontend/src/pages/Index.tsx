import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Heart, UserPlus, ClipboardList, Link2, ArrowRight, Droplets, MapPin, Phone,
  FileText, Share2, Search, Bell, Shield, Activity, AlertTriangle,Users
} from "lucide-react";



const steps = [
  {
    icon: UserPlus,
    title: "Complétez votre profil",
    description: "Connectez-vous avec les identifiants fournis par l'hôpital, complétez votre compte et changez votre mot de passe.",
  },
  {
    icon: Droplets,
    title: "Demande de sang",
    description: "Si vous avez besoin de sang, faites une demande en précisant le groupe sanguin, vos coordonnées et le lieu.",
  },
  {
    icon: Bell,
    title: "Envoi d'alertes",
    description: "Le système envoie instantanément des notifications à tous les donneurs .",
  },
  {
    icon: Users,
    title: "Réponse des donneurs",
    description: "Si vous êtes un donateur admissible, vous pourrez intervenir et offrir votre aide.",
  },
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

const benefits = [
  {
    icon: Heart,
    title: "Amélioration de la santé cardiovasculaire",
    description: "Le don régulier aide à réduire l'excès de fer dans le sang, ce qui peut diminuer les risques de maladies cardiovasculaires et de crises cardiaques.",
  },
  {
    icon: Shield,
    title: "Réduction des risques pour la santé",
    description: "En équilibrant les niveaux de fer dans l'organisme, le don de sang pourrait contribuer à réduire le risque de développer certaines maladies graves.",
  },
  {
    icon: Users,
    title: "Bien-être psychologique",
    description: "Donner son sang procure un profond sentiment d'accomplissement, renforce le lien social et offre la satisfaction inestimable de sauver des vies.",
  },
];

export default function Index() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/hospital/alerts")
      .then(res => res.json())
      .then(data => {
        // Only show active alerts
        const activeAlerts = data.filter((a: any) => a.status === "Active");
        setAlerts(activeAlerts);
      })
      .catch(err => console.error("Error fetching alerts on index:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Heart className="h-4 w-4" />
                Sauvez des vies, Partagez votre groupe sanguin
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
                Donnez votre sang aujourd’hui,  <span className="text-gradient">sauvez des vies</span> demain.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Rejoignez notre communauté de donneurs et participez à une mission humaine et vitale.              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/contact">
                  <Button variant="hero" size="lg" className="rounded-xl px-8 w-full sm:w-auto">
                    Rejoindre la communauté
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-xl px-8 border-2 border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] blur-3xl -z-10 transform rotate-12 scale-110"></div>
              <img
                src="/public/image2.jpeg"
                alt="Illustration médicale moderne"
                className="w-full h-auto object-cover rounded-[2rem] shadow-2xl border-8 border-white transform transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Notre plateforme connecte les donneurs avec ceux qui en ont besoin. Voici comment procéder.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 text-center group flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-7 w-7 text-primary"  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {i + 1}- {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">Nos Fonctionnalités</h2>
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

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
           <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">
                  Les bienfaits du don de sang
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Le don de sang ne profite pas qu'au receveur, les donneurs bénéficient également de nombreux avantages pour leur propre santé :
                </p>
              </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="shrink-0 h-14 w-14 rounded-xl bg-red-50 flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center">
              <div className="relative w-[300px] h-[450px] w-full">
                <div className="absolute inset-0 bg-red-50 rounded-full blur-3xl opacity-70 transform scale-110"></div>
                <img 
                  src="/public/télécharger (24).png" 
                  alt="Stéthoscope en forme de cœur" 
                  className="relative z-10 w-full h-auto object-contain drop-shadow-1xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

