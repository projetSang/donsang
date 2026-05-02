import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, User, Calendar, Droplets, MapPin, 
  Phone, Activity, Clock, ShieldCheck, Mail, Trash2,
  AlertCircle
} from "lucide-react";

interface PatientDetailsProps {
  patient: any;
  onBack: () => void;
}

export function PatientDetails({ patient, onBack }: PatientDetailsProps) {

  const handleDeleteDisease = async (diseaseToDelete: string) => {
    if (!confirm(`Supprimer "${diseaseToDelete}" ?`)) return;
    
    const currentDiseases = Array.isArray(patient.chronic_diseases) 
      ? patient.chronic_diseases 
      : (typeof patient.chronic_diseases === 'string' ? JSON.parse(patient.chronic_diseases) : []);

    const updatedDiseases = currentDiseases.filter((d: string) => d !== diseaseToDelete);
    
    try {
      const res = await fetch(`http://localhost:8000/api/hospital/patients/${patient.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          ...patient,
          chronic_diseases: updatedDiseases
        })
      });
      if (res.ok) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-bold text-2xl flex items-center gap-2">
              {patient.full_name}
              <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                ID: {patient.id}
              </span>
            </h3>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Calendar className="h-3.5 w-3.5" /> Dossier médical créé le {patient.admission_date}
            </p>
          </div>
        </div>
    
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Droplets className="h-24 w-24 text-primary fill-primary" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-accent text-primary mb-4">
                <Droplets className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Groupe Sanguin</p>
              <h4 className="text-4xl font-extrabold text-primary">{patient.blood_type}</h4>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Informations Personnelles
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">CIN / ID</p>
                  <p className="font-medium">{patient.cin || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">{patient.birth_date || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{patient.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Adresse</p>
                  <p className="font-medium">{patient.address || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Contact d'Urgence
            </h4>
            <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-between">
              <div>
                <p className="text-md text-muted-foreground font-mono mt-1">{patient.phone}</p>
              </div>
              <a href={`tel:${patient.phone}`}>
                 <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                   <Phone className="h-4 w-4" />
                 </Button>
              </a>
            </div>
          </div>

          <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-6">
            <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Alertes Médicales
            </h4>
            <div className="space-y-2">
              {(() => {
                const diseases = Array.isArray(patient.chronic_diseases) 
                  ? patient.chronic_diseases 
                  : (typeof patient.chronic_diseases === 'string' && patient.chronic_diseases.startsWith('[')
                      ? JSON.parse(patient.chronic_diseases) 
                      : []);
                
                return diseases.length > 0 ? diseases.map((c: string, i: number) => (
                  <div key={i} className="text-sm flex items-center justify-between gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg font-medium group">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5" />
                      {c}
                    </div>
                    <button 
                      onClick={() => handleDeleteDisease(c)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded-md transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Aucune maladie signalée</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
