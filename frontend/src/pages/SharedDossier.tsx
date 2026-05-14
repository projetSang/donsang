import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Activity, FileText, Download, Droplets, Phone, MapPin, Calendar, AlertCircle, RefreshCw, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Internal Sub-components to reduce main file size
const DossierHeader = ({ onPrint, logoUrl }: { onPrint: () => void, logoUrl: string }) => (
  <>
    <div className="print-only mb-6 border-b pb-4">
      <img src={logoUrl} alt="Logo" className="h-16 w-auto" />
    </div>
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dossier Médical Partagé</h1>
        <p className="text-muted-foreground mt-2">Accès en lecture seule. Partagé par le patient.</p>
      </div>
      <Button onClick={onPrint} variant="outline" className="no-print bg-white gap-2 shadow-sm border-slate-200 hover:bg-slate-50">
        <Printer className="h-4 w-4" /> Imprimer le dossier
      </Button>
    </div>
  </>
);

const PatientSidebar = ({ patient }: { patient: any }) => (
  <div className="space-y-6">
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center border-4 border-background shadow-sm">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-bold text-xl">{patient.full_name}</h2>
          <p className="text-sm text-muted-foreground">{patient.cin || "CIN non renseigné"}</p>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t border-border">
        {[
          { icon: Phone, text: patient.phone || "Non renseigné" },
          { icon: MapPin, text: patient.address || "Non renseignée" },
          { icon: Calendar, text: patient.birth_date || "Non renseignée" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <Droplets className="h-20 w-20 text-primary fill-primary" />
      </div>
      <p className="text-muted-foreground text-sm font-medium mb-2">Groupe Sanguin</p>
      <h4 className="text-4xl font-extrabold text-primary">{patient.blood_type || "Inconnu"}</h4>
    </div>
  </div>
);

const MedicalSection = ({ patient, diseases }: { patient: any, diseases: string[] }) => (
  <div className="lg:col-span-2 space-y-6">
    <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-6">
      <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" /> Alertes Médicales
      </h4>
      <div className="flex flex-wrap gap-2">
        {diseases.length > 0 ? diseases.map((c, i) => (
          <div key={i} className="text-sm flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg font-medium">
            <Activity className="h-3.5 w-3.5" /> {c}
          </div>
        )) : <p className="text-sm text-muted-foreground">Aucune maladie chronique signalée.</p>}
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" /> Autres Informations
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Allergies", value: patient.allergies || "Aucune" },
          { label: "Traitements", value: patient.current_treatments || "Aucun" },
          { label: "Antécédents", value: patient.medical_history || "Aucun", full: true }
        ].map((item, i) => (
          <div key={i} className={item.full ? "md:col-span-2" : ""}>
            <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
            <p className="font-medium text-sm mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" /> Documents
      </h4>
      <div className="divide-y divide-border border rounded-xl overflow-hidden">
        {patient.documents?.length > 0 ? patient.documents.map((doc: any) => (
          <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{doc.category} • {doc.date}</div>
              </div>
            </div>
            <a href={doc.file_url} target="_blank" rel="noreferrer" className="no-print">
              <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
          </div>
        )) : <div className="p-6 text-center text-muted-foreground text-sm">Aucun document.</div>}
      </div>
    </div>
  </div>
);

export default function SharedDossier() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, userType, isAuthenticated, loading: authLoading } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated && userType === "patient") {
      navigate("/patient");
      return;
    }

    const fetchDossier = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/shared-dossier/${token}`);
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setPatient(data.patient);
        } else {
          setError(data.message || "Dossier introuvable ou lien expiré.");
        }
      } catch (err) {
        setError("Erreur de connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDossier();
    }
  }, [token, authLoading, isAuthenticated, userType, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Chargement du dossier médical...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex flex-col items-center justify-center">
        <div className="bg-card p-8 rounded-2xl shadow-sm max-w-md text-center border border-border">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  const diseases = Array.isArray(patient.chronic_diseases)
    ? patient.chronic_diseases
    : (typeof patient.chronic_diseases === 'string' && patient.chronic_diseases.startsWith('[')
      ? JSON.parse(patient.chronic_diseases)
      : []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <style>{`
        @media screen { .print-only { display: none !important; } }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; margin-bottom: 20px; }
          .min-h-screen { background-color: white !important; padding-top: 0 !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .container { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .bg-card { border: none !important; shadow: none !important; }
        }
      `}</style>
      <div className="no-print"><Navbar /></div>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <DossierHeader onPrint={handlePrint} logoUrl="/logo_sang.png" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PatientSidebar patient={patient} />
          <MedicalSection patient={patient} diseases={diseases} />
        </div>
      </main>
      <div className="no-print"><Footer /></div>
    </div>
  );
}
