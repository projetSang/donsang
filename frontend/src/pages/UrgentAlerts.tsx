import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MapPin, Phone, AlertTriangle, Plus, ChevronLeft, ChevronRight
} from "lucide-react";

export default function UrgentAlerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
      blood_type: "A+",
      urgency_level: "Haute",
      city: "",
      quantity: "",
      description: "",
      direct_phone: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 6;

    const fetchAlerts = () => {
      fetch("http://localhost:8000/api/hospital/alerts")
        .then(res => res.json())
        .then(data => {
          const activeAlerts = data.filter((a: any) => a.status === "Active" || a.status === "Active_Public");
          // Reverse to show newest first
          setAlerts(activeAlerts.reverse());
          setCurrentPage(1);
        })
        .catch(err => console.error("Error fetching alerts:", err));
    };

    useEffect(() => {
      fetchAlerts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const response = await fetch("http://localhost:8000/api/hospital/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            hospital_id: 1, 
            status: "Active_Public"
          })
        });

        if (response.ok) {
          // Reset form and hide it
          setFormData({
            blood_type: "A+",
            urgency_level: "Haute",
            city: "",
            quantity: "",
            description: "",
            direct_phone: ""
          });
          setShowForm(false);
          // Refresh alerts
          fetchAlerts();
        } else {
          alert("Erreur lors de la création de l'alerte.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Une erreur de connexion est survenue.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    // Pagination calculation
    const indexOfLastAlert = currentPage * alertsPerPage;
    const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
    const currentAlerts = alerts.slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil(alerts.length / alertsPerPage);

    const paginate = (pageNumber: number) => {
      setCurrentPage(pageNumber);
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="pt-24 pb-16 overflow-hidden relative flex-grow">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col items-center gap-4 mb-10 justify-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 text-center">Appels aux dons urgents</h2>
            <p className="text-slate-500 text-center max-w-xl">
              Consultez les besoins urgents en sang ou publiez une nouvelle alerte si vous êtes dans une situation critique.
            </p>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              variant="hero" 
              className="rounded-xl px-8 mt-4"
            >
              <Plus className="h-5 w-5 mr-2" />
              Publier une alerte
            </Button>
          </div>

          {/* Formular Section */}
          {showForm && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-16 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Nouvelle Alerte</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Groupe Sanguin</label>
                    <select 
                      name="blood_type" 
                      value={formData.blood_type} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Niveau d'urgence</label>
                    <select 
                      name="urgency_level" 
                      value={formData.urgency_level} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    >
                      <option value="Normale">Normale</option>
                      <option value="Haute">Haute</option>
                      <option value="Critique">Critique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Quantité nécessaire</label>
                    <input 
                      type="text" 
                      name="quantity" 
                      placeholder="Ex: 2 poches" 
                      value={formData.quantity} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ville</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="Ex: Casablanca" 
                      required
                      value={formData.city} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Téléphone de contact</label>
                    <input 
                      type="tel" 
                      name="direct_phone" 
                      placeholder="votre numéro téléphone" 
                      required
                      value={formData.direct_phone} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description (Optionnel)</label>
                  <textarea 
                    name="description" 
                    placeholder="Précisez la situation de l'urgence ou l'hôpital..." 
                    rows={3}
                    value={formData.description} 
                    onChange={handleChange}
                    className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={isSubmitting} className="rounded-xl">
                    {isSubmitting ? "Envoi en cours..." : "Publier l'alerte"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Alerts Grid */}
          {alerts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white rounded-2xl border-l-4 border-primary p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10">
                        {alert.blood_type}
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${alert.urgency_level === 'Critique' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {alert.urgency_level}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">
                      {alert.status === "Active_Public" ? "Appel d'urgence public" : (alert.hospital?.name || "Hôpital Partenaire")}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {alert.city || alert.hospital?.city || "Ville non spécifiée"}
                    </div>
                    <p className="text-sm text-slate-600 mb-6 line-clamp-2 italic">
                      "{alert.description || "Besoin immédiat de donneurs de sang pour une urgence vitale."}"
                    </p>
                    <div className="flex gap-2">
                      {(alert.direct_phone || alert.hospital?.phone) ? (
                        <Button
                          variant="hero"
                          className="w-full rounded-xl gap-2"
                          onClick={() => window.location.href = `tel:${alert.direct_phone || alert.hospital?.phone}`}
                        >
                          <Phone className="h-4 w-4" />
                          Appeler {alert.direct_phone ? "directement" : "l'hôpital"}
                        </Button>
                      ) : (
                        <Link to="/contact" className="w-full">
                          <Button variant="hero" className="w-full rounded-xl">
                            Je souhaite donner
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => paginate(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl px-4"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "hero" : "outline"}
                        onClick={() => paginate(i + 1)}
                        className={`w-10 h-10 p-0 rounded-xl ${currentPage !== i + 1 ? 'hover:bg-slate-100 text-slate-600' : ''}`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl px-4"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune alerte active</h3>
              <p className="text-slate-500">Il n'y a actuellement aucun appel au don urgent dans votre région.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
