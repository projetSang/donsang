import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  Calendar as CalendarIcon, Clock, Building2, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, ChevronRight, Check, X, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  phone?: string;
}

interface Appointment {
  id: number;
  hospital_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  hospital: Hospital;
}

export function AppointmentsTab({ donorId }: { donorId: number }) {
  const { t } = useLanguage();
  const dashboardT = t.donorDashboard;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form State
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Quiz/Checklist State
  const [quizAnswers, setQuizAnswers] = useState({
    age: true,
    weight: true,
    delay: true,
    tattoo: false,
    illness: false,
  });
  const [showQuiz, setShowQuiz] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await apiFetch(`/donors/${donorId}/appointments`);
      if (data.status === "success") {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchHospitals = async () => {
    try {
      const data = await apiFetch("/public-hospitals");
      if (data.status === "success") {
        setHospitals(data.hospitals);
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    }
  };

  useEffect(() => {
    if (donorId) {
      setLoading(true);
      Promise.all([fetchAppointments(), fetchHospitals()]).finally(() => {
        setLoading(false);
      });
    }
  }, [donorId]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHospitalId) {
      toast.error(dashboardT.selectHospitalError);
      return;
    }
    if (!appointmentDate) {
      toast.error(dashboardT.chooseDateError);
      return;
    }
    if (!appointmentTime) {
      toast.error(dashboardT.chooseTimeError);
      return;
    }

    // Verify Quiz answers
    if (!quizAnswers.age || !quizAnswers.weight || !quizAnswers.delay || quizAnswers.tattoo || quizAnswers.illness) {
      toast.error(dashboardT.notEligibleError);
      return;
    }

    setBookingLoading(true);
    try {
      const response = await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          blood_donor_id: donorId,
          hospital_id: Number.parseInt(selectedHospitalId),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          notes: notes || null
        })
      });

      if (response.status === "success") {
        toast.success(response.message || dashboardT.bookingSuccess);
        // Reset Form
        setSelectedHospitalId("");
        setAppointmentDate("");
        setAppointmentTime("");
        setNotes("");
        setShowQuiz(true);
        setQuizAnswers({
          age: true,
          weight: true,
          delay: true,
          tattoo: false,
          illness: false,
        });
        fetchAppointments();
      } else {
        toast.error(response.message || dashboardT.bookingError);
      }
    } catch (err: any) {
      toast.error(err.message || dashboardT.connErrorAppt);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmé":
      case "Confirmed":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="h-3.5 w-3.5" /> {dashboardT.statusConfirmed}
        </span>;
      case "Annulé":
      case "Cancelled":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 w-fit">
          <X className="h-3.5 w-3.5" /> {dashboardT.statusCancelled}
        </span>;
      case "Terminé":
      case "Completed":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5 w-fit">
          <Check className="h-3.5 w-3.5" /> {dashboardT.statusCompleted}
        </span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 w-fit">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {dashboardT.statusPending}
        </span>;
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const isEligible = quizAnswers.age && quizAnswers.weight && quizAnswers.delay && !quizAnswers.tattoo && !quizAnswers.illness;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">{dashboardT.loadingAppts}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-reveal">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: Appointment Booking Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)]">
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <CalendarIcon className="h-5 w-5 text-primary" /> {dashboardT.bookNewAppt}
            </h3>

            <form onSubmit={handleBookAppointment} className="space-y-6 mt-6">
              
              {/* Select Hospital */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" /> {dashboardT.hospitalCenter}
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">{dashboardT.selectHospitalDefault}</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
                {selectedHospitalId && (
                  <p className="text-xs text-muted-foreground ml-1">
                    📍 {hospitals.find(h => h.id === Number.parseInt(selectedHospitalId))?.address}
                  </p>
                )}
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Select Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-primary" /> {dashboardT.desiredDate}
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Notes/Optional message */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" /> {dashboardT.notesOptional}
                  </label>
                  <input
                    type="text"
                    placeholder={dashboardT.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> {dashboardT.timeSlot}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${
                        appointmentTime === slot
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.05]"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist / Eligibility Quiz */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" /> {dashboardT.eligibilityQuiz}
                </h4>

                <div className="space-y-3 text-sm text-left">
                  {/* Q1 */}
                  <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizAnswers.age}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, age: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 font-semibold">{dashboardT.qAge}</span>
                  </label>

                  {/* Q2 */}
                  <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizAnswers.weight}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, weight: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 font-semibold">{dashboardT.qWeight}</span>
                  </label>

                  {/* Q3 */}
                  <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizAnswers.delay}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, delay: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 font-semibold">{dashboardT.qDelay}</span>
                  </label>

                  {/* Q4 */}
                  <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizAnswers.tattoo}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, tattoo: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span className="text-xs text-rose-700 font-semibold">⚠️ {dashboardT.qTattoo}</span>
                  </label>

                  {/* Q5 */}
                  <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizAnswers.illness}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, illness: e.target.checked })}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span className="text-xs text-rose-700 font-semibold">⚠️ {dashboardT.qIllness}</span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                disabled={bookingLoading || !isEligible}
                className="w-full bg-primary hover:bg-primary/95 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> {dashboardT.saving}
                  </>
                ) : !isEligible ? (
                  <>
                    <AlertTriangle className="h-5 w-5" /> {dashboardT.fillEligibility}
                  </>
                ) : (
                  <>
                    {dashboardT.confirmBooking} <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Appointment List / History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] h-full text-left">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 mb-4">
              {dashboardT.scheduledAppts}
            </h3>

            {appointments.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto">
                  <CalendarIcon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-500">{dashboardT.noScheduledAppts}</p>
                <p className="text-xs text-slate-400">{dashboardT.fillFormToSchedule}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                          {apt.hospital.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          📍 {apt.hospital.city}
                        </p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="border-t border-slate-200/50 pt-2 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {apt.appointment_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {apt.appointment_time}
                      </span>
                    </div>

                    {apt.notes && (
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-200/50 text-[10px] text-slate-500 italic">
                        "{apt.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
