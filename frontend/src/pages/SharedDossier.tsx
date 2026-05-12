import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  User, Activity, FileText, Download, Droplets, Phone, MapPin, Calendar, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SharedDossier() {
  const { token } = useParams<{ token: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex flex-col items-center justify-center">
        <Activity className="h-8 w-8 text-primary animate-spin" />
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

  return (
    <div className="min-h-screen bg-muted/30 pt-18 md:pt-16">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dossier Médical Partagé</h1>
          <p className="text-muted-foreground mt-2">Accès en lecture seule. Partagé par le patient.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone || "Non renseigné"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.address || "Non renseignée"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.birth_date || "Non renseignée"}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Droplets className="h-20 w-20 text-primary fill-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-sm font-medium mb-2">Groupe Sanguin</p>
                <h4 className="text-4xl font-extrabold text-primary">{patient.blood_type || "Inconnu"}</h4>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-6">
              <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Alertes Médicales
              </h4>
              <div className="space-y-2">
                {diseases.length > 0 ? diseases.map((c: string, i: number) => (
                  <div key={i} className="text-sm flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg font-medium w-fit">
                    <Activity className="h-3.5 w-3.5" />
                    {c}
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Aucune maladie chronique signalée.</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Autres Informations Médicales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Allergies</p>
                  <p className="font-medium text-sm mt-1">{patient.allergies || "Aucune"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Traitements en cours</p>
                  <p className="font-medium text-sm mt-1">{patient.current_treatments || "Aucun"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground font-medium">Antécédents médicaux</p>
                  <p className="font-medium text-sm mt-1">{patient.medical_history || "Aucun"}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Documents Médicaux
              </h4>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {patient.documents && patient.documents.length > 0 ? patient.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.category} • {doc.date}</div>
                      </div>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </a>
                  </div>
                )) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucun document enregistré.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
