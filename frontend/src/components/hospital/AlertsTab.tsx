import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Activity, AlertTriangle, MapPin, Users, Phone, X, CheckCircle2, XCircle } from "lucide-react";

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export function AlertsTab({ showNewAlert, setShowNewAlert, onViewDonors }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlertResponses, setSelectedAlertResponses] = useState<any[] | null>(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  
  const [formData, setFormData] = useState({
    hospital_id: 1, // CHU Casablanca par défaut
    blood_type: "Tous groupes",
    urgency_level: "critique",
    quantity: "",
    description: "",
    direct_phone: "",
    status: "Active"
  });

  const fetchAlerts = () => {
    fetch("http://localhost:8000/api/hospital/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/hospital/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowNewAlert(false);
        fetchAlerts();
        setFormData({
          hospital_id: 1,
          blood_type: "Tous groupes",
          urgency_level: "critique",
          quantity: "",
          description: "",
          direct_phone: "",
          status: "Active"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette alerte ?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/hospital/alerts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResponses = async (alertId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/hospital/alerts/${alertId}/responses`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAlertResponses(data);
        setShowResponsesModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseAlert = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/hospital/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Clôturée" })
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex items-center justify-between">
        <div className="animate-reveal">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            Urgences & Besoins en Sang
          </h1>
          <p className="text-slate-500 mt-1">Gérez vos alertes et trouvez des donneurs rapidement.</p>
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
              <select 
                className="mt-1 h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-destructive/20 outline-none"
                value={formData.blood_type}
                onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
              >
                <option value="Tous groupes">Tous groupes</option>
                <option value="O+, O−">O+, O−</option>
                {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Quantité (Poches)</label>
              <Input 
                type="number"
                placeholder="Quantité de poches" 
                className="mt-1 h-11 rounded-lg border-input bg-white" 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Niveau d'urgence</label>
              <select 
                className="mt-1 h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-destructive/20 outline-none"
                value={formData.urgency_level}
                onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
              >
                <option value="critique">Critique (&lt; 2 heures)</option>
                <option value="haute">Haute (Aujourd'hui)</option>
                <option value="moyenne">Moyenne (Cette semaine)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-slate-800">Numéro de téléphone direct (Optionnel)</label>
              <Input 
                type="text"
                placeholder="Ex: 0612345678" 
                className="mt-1 h-11 rounded-lg border-input bg-white" 
                value={formData.direct_phone}
                onChange={(e) => setFormData({...formData, direct_phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-slate-800">Informations complémentaires</label>
              <textarea 
                className="mt-1 flex w-full rounded-lg border border-input bg-white px-3 py-3 text-sm min-h-[80px] focus:ring-2 focus:ring-destructive/20 outline-none resize-none" 
                placeholder="Précisez le service (ex: Réanimation), des instructions pour l'accès..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-destructive/10">
            <Button variant="outline" size="sm" onClick={() => setShowNewAlert(false)}>Annuler</Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCreateAlert} 
              disabled={loading}
              className="shadow-lg shadow-destructive/20"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? "Diffusion..." : "Diffuser l'alerte locale"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {alerts.length === 0 && <p className="text-muted-foreground text-center py-8">Aucune alerte en cours.</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className={`bg-white rounded-xl border-l-4 p-6 shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${
            alert.status === 'Clôturée' 
              ? 'border-slate-200 border-y border-r opacity-80' 
              : alert.urgency_level === 'critique'
                ? 'border-red-600 border-y border-r'
                : alert.urgency_level === 'haute'
                  ? 'border-orange-500 border-y border-r'
                  : 'border-blue-500 border-y border-r'
          }`}>
            <div className="absolute top-0 right-0 p-5">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${alert.status === 'Clôturée' ? 'bg-slate-400' : alert.urgency_level === 'critique' ? 'bg-red-500' : alert.urgency_level === 'haute' ? 'bg-orange-500' : 'bg-blue-500'} opacity-60`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${alert.status === 'Clôturée' ? 'bg-slate-400' : alert.urgency_level === 'critique' ? 'bg-red-500' : alert.urgency_level === 'haute' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
              </span>
            </div>
            <div className="flex items-start gap-5">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all group-hover:scale-110 ${
                alert.status === 'Clôturée' 
                  ? 'bg-slate-200 text-slate-400 shadow-slate-200/50' 
                  : alert.urgency_level === 'critique'
                    ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/30'
                    : alert.urgency_level === 'haute'
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/30'
                      : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/30'
              }`}>
                <Activity className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-extrabold text-xl text-slate-900">Besoin : Donneurs {alert.blood_type}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    alert.status === 'Clôturée'
                      ? 'bg-slate-100 text-slate-500'
                      : alert.urgency_level === 'critique'
                        ? 'bg-red-100 text-red-700 animate-pulse'
                        : alert.urgency_level === 'haute'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.urgency_level}
                  </span>
                </div>
                
                <div className="text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
                   <b>{alert.quantity ? `${alert.quantity} poches requises` : "Quantité non spécifiée"}</b>
                </div>
                
                {alert.description && (
                  <p className="text-sm text-slate-500 mb-4 bg-slate-50/50 p-3 rounded-lg italic border-l-2 border-slate-200">
                    "{alert.description}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-700 font-medium mb-5">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="h-4 w-4 text-primary" /> {alert.hospital?.name || "CHU Casablanca"}
                  </span>
                  <span className={`flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 ${alert.status === 'Clôturée' ? 'text-slate-400' : 'text-green-600'}`}>
                    <Bell className="h-4 w-4" /> État : {alert.status}
                  </span>
                  {alert.direct_phone && (
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Phone className="h-4 w-4 text-primary" /> {alert.direct_phone}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="hero" 
                    size="sm" 
                    className="shadow-md"
                    onClick={() => onViewDonors(alert.blood_type)}
                  >
                    Voir les donneurs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shadow-sm border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => fetchResponses(alert.id)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Voir les réponses
                  </Button>
                  {alert.status !== 'Clôturée' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCloseAlert(alert.id)}
                      className="text-destructive font-semibold hover:bg-destructive/10"
                    >
                      Clôturer l'alerte
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-slate-500 font-semibold hover:bg-slate-100"
                    >
                      Supprimer l'historique
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showResponsesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" /> Réponses des patients
                </h3>
                <p className="text-slate-400 text-sm mt-1">Liste des personnes ayant répondu à cette alerte.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowResponsesModal(false)}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {!selectedAlertResponses || selectedAlertResponses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucune réponse pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAlertResponses.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                          r.status === 'available' ? 'bg-green-500' : 'bg-slate-400'
                        }`}>
                          {r.patient_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{r.patient_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {r.blood_type}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone || "N/A"}</span>
                            <span>{r.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        r.status === 'available' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.status === 'available' ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Disponible</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5" /> Indisponible</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 flex justify-end">
              <Button onClick={() => setShowResponsesModal(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
