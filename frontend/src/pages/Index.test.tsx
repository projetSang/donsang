import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "./Index";

// Mock API base url
vi.stubGlobal("import", { meta: { env: { VITE_API_BASE_URL: "http://localhost:8080/api" } } });

// Mock Language Context
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      hero: {
        badge: "Urgence Sang",
        title1: "Donnez votre",
        title2: "sang",
        title3: "sauvez des vies",
        subtitle: "Votre don peut faire la différence",
        joinCta: "Devenir donneur",
        loginCta: "Espace donneur",
      },
      howItWorks: {
        title: "Comment ça marche ?",
        subtitle: "Quatre étapes simples",
      },
      steps: [
        { title: "Inscription", description: "Inscrivez-vous en ligne" },
        { title: "Don", description: "Faites votre don" },
        { title: "Notification", description: "Soyez notifié" },
        { title: "Impact", description: "Sauvez des vies" },
      ],
      features: {
        title: "Fonctionnalités",
        subtitle: "Découvrez notre plateforme",
      },
      featuresList: [
        { title: "Alertes en temps réel", description: "Soyez alerté rapidement" },
        { title: "Carte interactive", description: "Trouvez les centres" },
        { title: "Historique de dons", description: "Suivez vos dons" },
        { title: "Notifications", description: "Restez informé" },
        { title: "Sécurité", description: "Données protégées" },
        { title: "Assistance", description: "Nous vous aidons" },
      ],
      benefits: {
        title: "Pourquoi donner ?",
        subtitle: "Les bienfaits du don de sang",
      },
      benefitsList: [
        { title: "Sauver des vies", description: "Chaque don sauve trois personnes" },
        { title: "Bilan de santé", description: "Mini examen gratuit" },
        { title: "Régénérer", description: "Renouvelle les cellules" },
      ],
      footer: {
        tagline: "SangVital",
        navigation: "Navigation",
        home: "Accueil",
        urgentAlerts: "Alertes",
        contact: "Contact",
        legal: "Légal",
        privacy: "Confidentialité",
        terms: "Conditions",
        dataProtection: "Données",
        contactTitle: "Contact",
        copyright: "SangVital 2026",
      },
      nav: {
        home: "Accueil",
        alerts: "Alertes",
        map: "Carte",
        about: "À propos",
        contact: "Contact",
        login: "Connexion",
        dashboard: "Tableau de bord",
        signIn: "Se connecter",
      },
    },
    lang: "fr",
  }),
}));

// Mock Auth Context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

describe("Index Landing Page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    
    // Stub fetch globally to return empty list of alerts
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("renders the landing page successfully", () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    expect(screen.getByText("Urgence Sang")).toBeInTheDocument();
    expect(screen.getByText("Devenir donneur")).toBeInTheDocument();
    expect(screen.getByText("Espace donneur")).toBeInTheDocument();
    expect(screen.getByText("Comment ça marche ?")).toBeInTheDocument();
  });
});
