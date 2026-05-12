import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, User, Calendar, Droplets, MapPin, 
  Phone, Activity, Clock, ShieldCheck, Mail, Trash2,
  AlertCircle, FileText, Download, Upload, Bell, Send
} from "lucide-react";

interface PatientDetailsProps {
  patient: any;
  onBack: () => void;
}

export function PatientDetails({ patient, onBack }: PatientDetailsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/patients/${patient.id}/documents`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(console.error);
  }, [patient.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("category", "Autre");

    setUploadingDoc(true);
    try {
      const res = await fetch(`http://localhost:8000/api/patients/${patient.id}/documents`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments([newDoc, ...documents]);
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;
    
    setSendingNotif(true);
    try {
      const res = await fetch(`http://localhost:8000/api/patients/${patient.id}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          type: "normal"
        })
      });
      if (res.ok) {
        setNotifTitle("");
        setNotifMessage("");
        alert("Notification envoyée avec succès !");
      } else {
        alert("Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setSendingNotif(false);
    }
  };

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

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Autres Informations Médicales
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Allergies</p>
                <p className="font-medium text-sm mt-1">{patient.allergies || "Aucune"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Traitements en cours</p>
                <p className="font-medium text-sm mt-1">{patient.current_treatments || "Aucun"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Antécédents médicaux</p>
                <p className="font-medium text-sm mt-1">{patient.medical_history || "Aucun"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Documents Médicaux
              </h4>
              <div>
                <input 
                  type="file" 
                  id="hospital-document-upload" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={uploadingDoc}
                />
                <label htmlFor="hospital-document-upload">
                  <Button variant="outline" size="sm" asChild disabled={uploadingDoc} className="h-8">
                    <span>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {uploadingDoc ? "..." : "Ajouter"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {documents.length > 0 ? documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium line-clamp-1">{doc.name}</div>
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

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Envoyer une Notification
            </h4>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Titre</label>
                <input 
                  type="text" 
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ex: Rappel de rendez-vous"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message (Optionnel)</label>
                <textarea 
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  placeholder="Message détaillé..."
                />
              </div>
              <Button type="submit" disabled={sendingNotif || !notifTitle.trim()} className="w-full">
                {sendingNotif ? "Envoi..." : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Envoyer
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
