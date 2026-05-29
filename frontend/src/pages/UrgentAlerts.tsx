import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MapPin, Phone, AlertTriangle, Plus, ChevronLeft, ChevronRight, Heart, X, User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function UrgentAlerts() {
    const { t, isRtl } = useLanguage();
    const pageT = t.urgentAlertsPage;

    const [alerts, setAlerts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    
    // Auth and donation modal states
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [donorForm, setDonorForm] = useState({
      full_name: "",
      email: "",
      phone: "",
      city: "",
    });
    const [donorSubmitting, setDonorSubmitting] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<"quick" | "login">("quick");

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

    const handleDonateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAlert) return;
      setDonorSubmitting(true);
      try {
        // 1. Register guest as donor first (which allows alert response)
        const resDonor = await fetch("https://backend-production-4a57.up.railway.app/api/hospital/donors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            full_name: donorForm.full_name,
            email: donorForm.email,
            phone: donorForm.phone,
            blood_type: selectedAlert.blood_type,
            city: donorForm.city,
          })
        });

        if (!resDonor.ok) {
          throw new Error(pageT.errorDonorProfile);
        }

        const donorData = resDonor.ok ? await resDonor.json() : null;
        if (!donorData || !donorData.id) {
          throw new Error(pageT.errorRetrieveDonor);
        }
        const donorId = donorData.id;

        // 2. Respond to alert
        const resResponse = await fetch("https://backend-production-4a57.up.railway.app/api/alerts/respond", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            alert_id: selectedAlert.id,
            blood_donor_id: donorId,
            status: "available"
          })
        });

        if (resResponse.ok) {
          toast.success(pageT.successProposalTitle, {
            description: pageT.successProposalDescEmail.replace("{email}", donorForm.email),
            duration: 6000
          });
          setShowDonateModal(false);
          setDonorForm({ full_name: "", email: "", phone: "", city: "" });
        } else {
          toast.error(pageT.errorRegisterProposal);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || pageT.errorConnection);
      } finally {
        setDonorSubmitting(false);
      }
    };

    const handleLoggedInDonate = async () => {
      if (!selectedAlert || !user) return;
      setDonorSubmitting(true);
      try {
        const res = await fetch("https://backend-production-4a57.up.railway.app/api/alerts/respond", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            alert_id: selectedAlert.id,
            blood_donor_id: user.id,
            status: "available"
          })
        });

        if (res.ok) {
          toast.success(pageT.successProposalTitle, {
            description: pageT.successProposalDescGeneral,
            duration: 5000
          });
          setShowDonateModal(false);
        } else {
          toast.error(pageT.errorRegisterProposal);
        }
      } catch (err) {
        console.error(err);
        toast.error(pageT.errorConnection);
      } finally {
        setDonorSubmitting(false);
      }
    };
  
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 6;

    const fetchAlerts = () => {
      fetch("https://backend-production-4a57.up.railway.app/api/hospital/alerts")
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
        const response = await fetch("https://backend-production-4a57.up.railway.app/api/hospital/alerts", {
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
          alert(pageT.errorCreateAlert);
        }
      } catch (error) {
        console.error("Error:", error);
        alert(pageT.errorConnection);
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
      
      <section className="pt-24 pb-16 overflow-hidden relative flex-grow animate-reveal">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col items-center gap-4 mb-10 justify-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 text-center">{pageT.title}</h2>
            <p className="text-slate-500 text-center max-w-xl">
              {pageT.subtitle}
            </p>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              variant="hero" 
              className="rounded-xl px-8 mt-4 hidden"
            >
              <Plus className="h-5 w-5 mr-2" />
              {pageT.publishBtn}
            </Button>
          </div>

          {/* Formular Section */}
          {showForm && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-16 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{pageT.newAlertTitle}</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{pageT.bloodType}</label>
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
                    <label className="text-sm font-semibold text-slate-700">{pageT.urgencyLevel}</label>
                    <select 
                      name="urgency_level" 
                      value={formData.urgency_level} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    >
                      <option value="Normale">{pageT.normal}</option>
                      <option value="Haute">{pageT.high}</option>
                      <option value="Critique">{pageT.critical}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{pageT.requiredQuantity}</label>
                    <input 
                      type="text" 
                      name="quantity" 
                      placeholder={pageT.quantityPlaceholder} 
                      value={formData.quantity} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{pageT.city}</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder={pageT.cityPlaceholder} 
                      required
                      value={formData.city} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{pageT.contactPhone}</label>
                    <input 
                      type="tel" 
                      name="direct_phone" 
                      placeholder={pageT.phonePlaceholder} 
                      required
                      value={formData.direct_phone} 
                      onChange={handleChange}
                      className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{pageT.descriptionOpt}</label>
                  <textarea 
                    name="description" 
                    placeholder={pageT.descriptionPlaceholder} 
                    rows={3}
                    value={formData.description} 
                    onChange={handleChange}
                    className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 border focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                    {pageT.cancel}
                  </Button>
                  <Button type="submit" variant="hero" disabled={isSubmitting} className="rounded-xl">
                    {isSubmitting ? pageT.sending : pageT.publishSubmit}
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
                  <div key={alert.id} className="bg-white rounded-2xl border-l-4 border-primary p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10">
                          {alert.blood_type}
                        </div>
                        {(() => {
                          const level = (alert.urgency_level || "").toLowerCase();
                          const isCritical = level === "critique" || level === "critical";
                          const isHigh = level === "haute" || level === "high";
                          const isMedium = level === "moyenne" || level === "medium";
                          const isNormal = level === "normale" || level === "normal";

                          let badgeClass = "bg-slate-100 text-slate-700";
                          let badgeText = alert.urgency_level;

                          if (isCritical) {
                            badgeClass = "bg-red-100 text-red-700";
                            badgeText = pageT.critical;
                          } else if (isHigh) {
                            badgeClass = "bg-orange-100 text-orange-700";
                            badgeText = pageT.high;
                          } else if (isMedium) {
                            badgeClass = "bg-amber-100 text-amber-700";
                            badgeText = pageT.medium;
                          } else if (isNormal) {
                            badgeClass = "bg-blue-100 text-blue-700";
                            badgeText = pageT.normal;
                          }

                          return (
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                              {badgeText}
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-slate-900">
                        {alert.status === "Active_Public" ? pageT.publicEmergency : (alert.hospital?.name || pageT.partnerHospital)}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {alert.city || alert.hospital?.city || pageT.unspecifiedCity}
                      </div>
                      <p className="text-sm text-slate-600 mb-6 line-clamp-3 italic">
                        "{alert.description || pageT.defaultDescription}"
                      </p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      {(alert.direct_phone || alert.hospital?.phone) ? (
                        <Button
                          variant="hero"
                          className="w-full rounded-xl gap-2 text-white font-bold"
                          onClick={() => window.location.href = `tel:${alert.direct_phone || alert.hospital?.phone}`}
                        >
                          <Phone className="h-4 w-4" />
                          {pageT.callDirectly}
                        </Button>
                      ) : (
                        <Button
                          variant="hero"
                          className="w-full rounded-xl text-white font-bold"
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate("/register");
                            } else {
                              setSelectedAlert(alert);
                              setShowDonateModal(true);
                            }
                          }}
                        >
                          {pageT.iWantToDonate}
                        </Button>
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
                    {pageT.previous}
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
                    {pageT.next}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm animate-reveal">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">{pageT.noAlertsTitle}</h3>
              <p className="text-slate-500">{pageT.noAlertsDesc}</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Donation */}
      {showDonateModal && selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-white animate-pulse fill-white" />
                <div>
                  <h3 className="text-xl font-black">{pageT.donationProposal}</h3>
                  <p className="text-red-100 text-xs mt-0.5">{pageT.saveALife}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDonateModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Alert Info Card */}
              <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 mb-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-red-500/20 shrink-0">
                  {selectedAlert.blood_type}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedAlert.status === "Active_Public" ? pageT.publicEmergency : (selectedAlert.hospital?.name || pageT.partnerHospital)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    {selectedAlert.city || selectedAlert.hospital?.city || "Casablanca"}
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                /* LOGGED IN USER */
                <div className="space-y-6 text-center py-4">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <Heart className="h-8 w-8 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{pageT.helloUser.replace("{name}", user.full_name || user.name)}</h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                      {pageT.availDesc.replace("{bloodType}", selectedAlert.blood_type)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDonateModal(false)}
                      className="w-full rounded-xl h-11"
                    >
                      {pageT.cancel}
                    </Button>
                    <Button 
                      variant="hero"
                      onClick={handleLoggedInDonate}
                      disabled={donorSubmitting}
                      className="w-full rounded-xl h-11 bg-red-600 hover:bg-red-700 shadow-md text-white font-bold"
                    >
                      {donorSubmitting ? pageT.sending : pageT.confirmDonation}
                    </Button>
                  </div>
                </div>
              ) : (
                /* GUEST USER */
                <div>
                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 mb-6">
                    <button
                      onClick={() => setActiveModalTab("quick")}
                      className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeModalTab === "quick" 
                          ? "border-red-600 text-red-600" 
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {pageT.quickDonation}
                    </button>
                    <button
                      onClick={() => setActiveModalTab("login")}
                      className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeModalTab === "login" 
                          ? "border-red-600 text-red-600" 
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {pageT.signIn}
                    </button>
                  </div>

                  {activeModalTab === "quick" ? (
                    <form onSubmit={handleDonateSubmit} className="space-y-4">
                      <p className="text-xs text-slate-500 mb-2">
                        {pageT.quickDonationDesc}
                      </p>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{pageT.fullName}</label>
                        <input
                          type="text"
                          required
                          placeholder={pageT.fullNamePlaceholder}
                          value={donorForm.full_name}
                          onChange={(e) => setDonorForm({...donorForm, full_name: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{pageT.email}</label>
                        <input
                          type="email"
                          required
                          placeholder={pageT.emailPlaceholder}
                          value={donorForm.email}
                          onChange={(e) => setDonorForm({...donorForm, email: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">{pageT.modalPhone}</label>
                          <input
                            type="tel"
                            required
                            placeholder={pageT.modalPhonePlaceholder}
                            value={donorForm.phone}
                            onChange={(e) => setDonorForm({...donorForm, phone: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-sm focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">{pageT.cityLabel}</label>
                          <input
                            type="text"
                            required
                            placeholder={pageT.cityLabelPlaceholder}
                            value={donorForm.city}
                            onChange={(e) => setDonorForm({...donorForm, city: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-sm focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setShowDonateModal(false)}
                          className="w-full rounded-xl h-11"
                        >
                          {pageT.cancel}
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={donorSubmitting}
                          className="w-full rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white shadow-md font-bold"
                        >
                          {donorSubmitting ? pageT.sending : pageT.sendProposal}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6 text-center py-6">
                      <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{pageT.connectAccount}</h4>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                          {pageT.connectAccountDesc}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link to="/login" className="w-full">
                          <Button className="w-full rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white shadow-md font-bold">
                            {pageT.signInNow}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
