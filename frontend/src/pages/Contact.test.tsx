import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contact from "./Contact";

// Mock API base url
vi.stubGlobal("import", { meta: { env: { VITE_API_BASE_URL: "http://localhost:8080/api" } } });

// Mock Language Context
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      contact: {
        title: "Contactez-nous",
        subtitle: "Contactez notre équipe",
        iAmHospital: "Je suis un hôpital",
        hospitalDesc: "Demander un compte",
        requestAccount: "Demander un compte",
        iAmUser: "Je suis un citoyen",
        userDesc: "Envoyer un message",
        sendMessage: "Envoyer un message",
        back: "Retour",
        backBtn: "Retourner",
        responsibleName: "Nom du responsable *",
        professionalEmail: "Email professionnel *",
        telephone: "Téléphone *",
        hospitalName: "Nom de l'établissement *",
        villeStar: "Ville *",
        addressOpt: "Adresse",
        optionalLabel: "(optionnel)",
        additionalMessage: "Message additionnel",
        adminNotice: "Note administrative",
        sending: "Envoi en cours...",
        sendRequest: "Envoyer la demande",
        yourName: "Votre nom *",
        yourEmail: "Votre email *",
        telephoneOpt: "Téléphone",
        concernedHospital: "Hôpital concerné *",
        selectHospital: "Sélectionnez l'établissement",
        subject: "Sujet",
        subjectOptional: "(optionnel)",
        subjectPlaceholder: "Quel est le sujet ?",
        yourMessage: "Votre message *",
        messagePlaceholder: "Saisissez votre message...",
        sendBtn: "Envoyer",
        successHospitalTitle: "Demande envoyée",
        successHospitalDesc: "Merci",
        successUserTitle: "Message envoyé",
        successUserDesc: "Merci",
      },
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

describe("Contact Page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    
    // Stub fetch globally to return empty list of hospitals
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("renders the choice screen initially", () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    expect(screen.getByText("Contactez-nous")).toBeInTheDocument();
    expect(screen.getByText("Je suis un hôpital")).toBeInTheDocument();
    expect(screen.getByText("Je suis un citoyen")).toBeInTheDocument();
  });

  it("switches to hospital form when selected", () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Je suis un hôpital"));
    expect(screen.getByText("Nom du responsable *")).toBeInTheDocument();
  });

  it("switches to user form when selected", () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Je suis un citoyen"));
    expect(screen.getByText("Votre nom *")).toBeInTheDocument();
  });
});
