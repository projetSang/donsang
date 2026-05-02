import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Activity, AlertTriangle, MapPin, Users } from "lucide-react";

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export function AlertsTab({ showNewAlert, setShowNewAlert }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/hospital/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div className="animate-reveal">
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-primary" />
                Urgences & Besoins en Sang
              </h1>
              <p className="text-slate-500 mt-1">Gérez vos alertes et trouvez des donneurs rapidement .</p>
            </div>
            
        <Button variant="hero" size="sm" onClick={() => setShowNewAlert(!showNewAlert)}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Lancer une alerte
        </Button>
      </div>

      {showNewAlert && (
        <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-6 shadow-sm">
          <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            Formulaire de demande urgente
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="text-sm font-medium text-slate-800">Groupes Sanguins Requis</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-destructive/20 outline-none">
                <option>O− Uniquement (Urgence absolue)</option>
                <option>O+, O−</option>
                <option>Tous groupes</option>
                {bloodGroups.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Quantité (Poches)</label>
              <Input placeholder="Ex: 5" className="mt-1 h-11 rounded-lg border-input bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Niveau d'urgence</label>
              <select className="mt-1 h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-destructive/20 outline-none">
                <option value="critique">Critique (&lt; 2 heures)</option>
                <option value="haute">Haute (Aujourd'hui)</option>
                <option value="moyenne">Moyenne (Cette semaine)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-slate-800">Informations complémentaires</label>
              <textarea 
                className="mt-1 flex w-full rounded-lg border border-input bg-white px-3 py-3 text-sm min-h-[80px] focus:ring-2 focus:ring-destructive/20 outline-none resize-none" 
                placeholder="Précisez le service (ex: Réanimation), des instructions pour l'accès, ou un numéro direct..." 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-destructive/10">
            <Button variant="outline" size="sm" onClick={() => setShowNewAlert(false)}>Annuler</Button>
            <Button variant="destructive" size="sm" onClick={() => setShowNewAlert(false)} className="shadow-lg shadow-destructive/20">
              <Bell className="h-4 w-4 mr-2" />
              Diffuser l'alerte locale
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {alerts.length === 0 && <p className="text-muted-foreground">Aucune alerte en cours.</p>}
        {alerts.map((alert, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
            <div className="flex items-start gap-5">
              <div className="h-14 w-14 rounded-full hero-gradient flex items-center justify-center text-primary-foreground shrink-0 shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
                <Activity className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-xl text-slate-900 pr-8">Besoin : Donneurs {alert.blood_type}</div>
                <div className="text-sm font-medium text-slate-600 mt-1 mb-4 flex items-center gap-2">
                  Urgence: {alert.urgency_level}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-700 font-medium mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                    <MapPin className="h-4 w-4 text-primary" /> {alert.hospital?.name || "CHU Casablanca"}
                  </span>
                  <span className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                    <Bell className="h-4 w-4 text-blue-500" /> État : {alert.status}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button variant="hero" size="sm" className="shadow-md">
                    Voir les donneurs
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive font-semibold hover:bg-destructive/10">
                    Clôturer l'alerte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
