import { 
  UserPlus, Droplets, Bell, Users, FileText, Share2, Search, Shield, Heart 
} from "lucide-react";

export const steps = [
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

export const features = [
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

export const benefits = [
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

export const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
