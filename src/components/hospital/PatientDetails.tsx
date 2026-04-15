import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, User, Calendar, Droplets, MapPin, 
  Phone, Activity, Clock, ShieldCheck, FileText,
  AlertCircle
} from "lucide-react";

interface PatientDetailsProps {
  patient: any;
  onBack: () => void;
}

export function PatientDetails({ patient, onBack }: PatientDetailsProps) {
  // Mock detailed data
  const details = {
    cin: "BE123456",
    address: "Angle Boulevard Zerktouni et Bd Mohamed V, Casablanca",
    phone: "06 12 34 56 78",
    email: "ahmed.bouzid@email.com",
    lastAdmission: "12 Avril 2026",
    history: [
      { date: "12/04/2026", type: "Urgence", description: "Douleurs abdominales aiguës", doctor: "Dr. Alami" },
      { date: "05/11/2025", type: "Consultation", description: "Bilan annuel", doctor: "Dr. Benani" },
      { date: "20/09/2025", type: "Laboratoire", description: "Analyse sanguine complète", doctor: "Dr. Tazi" },
    ],
    conditions: ["Diabète Type 2", "Hypertension"],
    allergies: ["Pénicilline"],
    emergencyContact: "Fatima Bouzid (Épouse) - 06 98 76 54 32"
  };

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-bold text-2xl flex items-center gap-2">
            {patient.name}
            <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              ID: {patient.id}
            </span>
          </h3>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5" /> Dossier médical créé le {patient.date}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Stats */}
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
              <h4 className="text-4xl font-extrabold text-primary">{patient.blood}</h4>
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
                  <p className="font-medium">{details.cin}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Âge</p>
                  <p className="font-medium">{patient.age} ans</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{details.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Adresse</p>
                  <p className="font-medium">{details.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-6">
            <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Alertes Médicales
            </h4>
            <div className="space-y-2">
              {details.conditions.map((c, i) => (
                <div key={i} className="text-sm flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg font-medium">
                  <Activity className="h-3.5 w-3.5" />
                  {c}
                </div>
              ))}
              <div className="text-sm flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {details.allergies[0]} (Allergie)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Historique des Visites
              </h4>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Tout voir
              </Button>
            </div>
            <div className="divide-y divide-border">
              {details.history.map((item, i) => (
                <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-primary bg-accent/50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {item.type}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{item.date}</span>
                  </div>
                  <p className="font-medium text-sm">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Médecin: {item.doctor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Contact d'Urgence
            </h4>
            <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{details.emergencyContact.split(' - ')[0]}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{details.emergencyContact.split(' - ')[1]}</p>
              </div>
              <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
