import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  User, Activity, FileText, Download, Droplets, Phone, MapPin, Calendar, AlertCircle, RefreshCw, Printer, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Internal Sub-components to reduce main file size
const DossierHeader = ({ onPrint, logoUrl }: { onPrint: () => void, logoUrl: string }) => (
  <>
    <div className="print-only mb-6 border-b pb-4 flex items-center justify-between">
      <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
      <div className="text-xs text-muted-foreground font-mono">Document Officiel - Projet Sang</div>
    </div>
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dossier Médical Partagé</h1>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
            <ShieldCheck className="h-3 w-3" /> Sécurisé
          </div>
        </div>
        <p className="text-muted-foreground">Accès sécurisé en lecture seule pour les professionnels de santé.</p>
      </div>
      <Button onClick={onPrint} variant="outline" className="no-print bg-white gap-2 shadow-sm border-slate-200 hover:bg-slate-50 hover:text-primary transition-all duration-300 rounded-xl">
        <Printer className="h-4 w-4" /> Imprimer le dossier
      </Button>
    </div>
  </>
);

const PatientSidebar = ({ patient }: { patient: any }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
      
      <div className="relative z-10 flex flex-col items-center text-center mb-8">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl mb-4">
          <User className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="font-black text-2xl text-slate-900">{patient.full_name}</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mt-2 uppercase tracking-wide">
          CIN: {patient.cin || "Non renseigné"}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-50">
        {[
          { icon: Phone, text: patient.phone || "Non renseigné", label: "Téléphone" },
          { icon: MapPin, text: patient.address || "Non renseignée", label: "Adresse" },
          { icon: Calendar, text: patient.birth_date || "Non renseignée", label: "Date de naissance" },
          { icon: Activity, text: patient.height ? `${patient.height} cm` : "N/A", label: "Taille" },
          { icon: Droplets, text: patient.weight ? `${patient.weight} kg` : "N/A", label: "Poids" }
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
            <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <item.icon className="h-4 w-4 text-slate-400" />
              </div>
              <span>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4">
        <Droplets className="h-24 w-24 text-white fill-white transition-transform group-hover:scale-110 duration-700" />
      </div>
      <div className="relative z-10">
        <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest mb-2">Groupe Sanguin</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-6xl font-black text-white drop-shadow-md">{patient.blood_type || "??"}</h4>
          <span className="text-white/60 font-bold">Rh+</span>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
          <Activity className="h-3 w-3" /> Compatible O- / AB+
        </div>
      </div>
    </div>
  </div>
);

const MedicalSection = ({ patient, diseases }: { patient: any, diseases: string[] }) => (
  <div className="lg:col-span-2 space-y-6">
    <div className="bg-red-50/50 rounded-3xl border border-red-100 p-8 shadow-sm">
      <h4 className="font-black text-red-900 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
        <AlertCircle className="h-5 w-5 text-red-500" /> Alertes Médicales & Chroniques
      </h4>
      <div className="flex flex-wrap gap-3">
        {diseases.length > 0 ? diseases.map((c, i) => (
          <div key={i} className="flex items-center gap-2.5 px-4 py-2 bg-white text-red-700 rounded-2xl font-bold text-sm shadow-sm border border-red-100 hover:scale-105 transition-transform">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> {c}
          </div>
        )) : (
          <div className="flex items-center gap-3 text-slate-500 bg-white/50 px-6 py-4 rounded-2xl border border-dashed border-slate-200 w-full">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">Aucune pathologie chronique signalée par le patient.</span>
          </div>
        )}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
      <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
        <Activity className="h-5 w-5 text-primary" /> Synthèse Médicale
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { label: "Allergies connues", value: patient.allergies || "Aucune allergie signalée", icon: AlertCircle },
          { label: "Traitements actuels", value: patient.current_treatments || "Aucun traitement en cours", icon: Activity },
          { label: "Antécédents familiaux & personnels", value: patient.medical_history || "Aucun antécédent majeur renseigné", full: true, icon: FileText }
        ].map((item, i) => (
          <div key={i} className={item.full ? "md:col-span-2" : ""}>
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium text-sm leading-relaxed">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
      <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
        <FileText className="h-5 w-5 text-primary" /> Documents Externes
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {patient.documents?.length > 0 ? patient.documents.map((doc: any) => (
          <div key={doc.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{doc.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.category} • {new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <a 
              href={doc.file_url} 
              target="_blank" 
              rel="noreferrer" 
              className="no-print h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => toast.success("Téléchargement lancé")}
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        )) : (
          <div className="col-span-full p-8 text-center text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            Aucun document médical n'a été rattaché à ce dossier.
          </div>
        )}
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
      const patientSlug = slugify(user?.full_name || user?.name || "patient");
      navigate(`/Donsang/Mon-dossier/${patientSlug}`);
      return;
    }

    const fetchDossier = async () => {
      try {
        const data = await apiFetch(`/shared-dossier/${token}`);

        if (data.status === "success") {
          setPatient(data.patient);
        } else {
          setError(data.message || "Dossier introuvable ou lien expiré.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur de connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDossier();
    }
  }, [token]); // Removed auth redirect to allow patient to preview their own link

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
