import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  Calendar as CalendarIcon, Clock, Droplet, Phone, CreditCard,
  Check, X, RefreshCw, Filter, CheckCircle2
} from "lucide-react";

interface Patient {
  id: number;
  full_name: string;
  blood_type: string;
  phone: string;
  cin: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  patient: Patient;
}

export function AppointmentsTab({ hospitalId }: Readonly<{ hospitalId: number }>) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      const data = await apiFetch(`/hospitals/${hospitalId}/appointments`);
      if (data.status === "success") {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching hospital appointments:", err);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      setLoading(true);
      fetchAppointments().finally(() => {
        setLoading(false);
      });
    }
  }, [hospitalId]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const response = await apiFetch(`/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.status === "success") {
        toast.success(response.message || `Rendez-vous mis en statut: ${newStatus}`);
        fetchAppointments();
      } else {
        toast.error(response.message || "Une erreur est survenue.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmé":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmé
        </span>;
      case "Annulé":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
          <X className="h-3.5 w-3.5" /> Annulé
        </span>;
      case "Terminé":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1 w-fit">
          <Check className="h-3.5 w-3.5" /> Terminé
        </span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit animate-pulse">
          En attente
        </span>;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-reveal">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)]">
        
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="h-5.5 w-5.5 text-primary" /> Demandes de Rendez-vous
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gérez les créneaux et accueillez les donneurs de sang planifiés.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 w-fit">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
        </div>

        {/* List of Appointments */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-sm">
              <CalendarIcon className="h-8 w-8 text-slate-350" />
            </div>
            <div className="space-y-1">
              <p className="text-md font-bold text-slate-600">Aucun rendez-vous trouvé</p>
              <p className="text-xs text-slate-400">Aucune demande ne correspond à ce filtre actuellement.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Donneur</th>
                  <th className="px-6 py-4">Groupe Sanguin</th>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Remarques / CIN</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-sm">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Donor Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                          {apt.patient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold leading-tight">{apt.patient.full_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {apt.patient.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Blood Type */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                        <Droplet className="h-3.5 w-3.5 fill-rose-600 text-rose-600" /> {apt.patient.blood_type}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                          <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {apt.appointment_date}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {apt.appointment_time}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>

                    {/* Notes / Details */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-w-[200px]">
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" /> CIN: {apt.patient.cin || "N/A"}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-400 italic leading-tight truncate" title={apt.notes}>
                            "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === apt.id ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <>
                            {apt.status === "En attente" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Confirmé")}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all"
                                  title="Confirmer"
                                >
                                  <Check className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Annulé")}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all"
                                  title="Annuler"
                                >
                                  <X className="h-4.5 w-4.5" />
                                </button>
                              </>
                            )}
                            
                            {apt.status === "Confirmé" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Terminé")}
                                  className="px-2.5 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:bg-primary/95 transition-all flex items-center gap-1"
                                  title="Marquer le don comme effectué"
                                >
                                  <Check className="h-3.5 w-3.5" /> Effectué
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, "Annulé")}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all"
                                  title="Annuler"
                                >
                                  <X className="h-4.5 w-4.5" />
                                </button>
                              </>
                            )}

                            {apt.status === "Terminé" && (
                              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Don d'honneur fait
                              </span>
                            )}

                            {apt.status === "Annulé" && (
                              <span className="text-xs text-rose-500 font-semibold">
                                Rendez-vous annulé
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
