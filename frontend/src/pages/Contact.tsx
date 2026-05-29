import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Mail, Phone, MapPin, Send, Building2, User, ArrowLeft,
  CheckCircle2, Shield, Heart
} from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();
  const [contactType, setContactType] = useState<"choice" | "hospital" | "user">("choice");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);

  const [hospitalForm, setHospitalForm] = useState({
    name: "", email: "", phone: "", hospital_name: "", city: "", address: "", message: "",
  });

  const [userForm, setUserForm] = useState({
    name: "", email: "", phone: "", subject: "", hospital_id: "", message: "",
  });

  useEffect(() => {
    fetch("https://backend-production-4a57.up.railway.app/api/admin/hospitals")
      .then(res => res.json())
      .then(data => setHospitals(data))
      .catch(console.error);
  }, []);

  const handleHospitalChange = (e: any) => setHospitalForm({ ...hospitalForm, [e.target.id]: e.target.value });
  const handleUserChange = (e: any) => setUserForm({ ...userForm, [e.target.id]: e.target.value });

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("https://backend-production-4a57.up.railway.app/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...hospitalForm, type: "hospital" }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Erreur lors de l'envoi.");
    } catch { alert("Erreur de connexion."); }
    finally { setIsSubmitting(false); }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedHospital = hospitals.find(h => String(h.id) === userForm.hospital_id);
    try {
      const res = await fetch("https://backend-production-4a57.up.railway.app/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userForm,
          type: "user",
          subject: selectedHospital
            ? `Contact concernant: ${selectedHospital.name}`
            : userForm.subject || "Message général",
        }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Erreur lors de l'envoi.");
    } catch { alert("Erreur de connexion."); }
    finally { setIsSubmitting(false); }
  };

  const goBack = () => { setContactType("choice"); setSubmitted(false); };

  const c = t.contact;

  return (
    <div className="min-h-screen bg-[#faf8f8] flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 flex-grow">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3">{c.title}</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{c.subtitle}</p>
          </div>

          {/* Success */}
          {submitted ? (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  {contactType === "hospital" ? c.successHospitalTitle : c.successUserTitle}
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {contactType === "hospital" ? c.successHospitalDesc : c.successUserDesc}
                </p>
                <Button variant="outline" onClick={goBack} className="rounded-xl h-11 px-6 gap-2">
                  <ArrowLeft className="h-4 w-4" /> {c.backBtn}
                </Button>
              </div>
            </div>

          ) : contactType === "choice" ? (
            /* CHOICE */
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Hospital Card */}
                <button
                  onClick={() => setContactType("hospital")}
                  className="group bg-white rounded-3xl border-2 border-slate-100 hover:border-primary/40 p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{c.iAmHospital}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{c.hospitalDesc}</p>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Shield className="h-4 w-4" />
                      {c.requestAccount}
                      <span className="ml-auto group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>

                {/* User Card */}
                <button
                  onClick={() => setContactType("user")}
                  className="group bg-white rounded-3xl border-2 border-slate-100 hover:border-rose-300 p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-rose-100/50 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 border-2 border-rose-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-rose-200/60 transition-all duration-300">
                      <Heart className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{c.iAmUser}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{c.userDesc}</p>
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                      <User className="h-4 w-4" />
                      {c.sendMessage}
                      <span className="ml-auto group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Contact Info Bar */}
              <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-center gap-8 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <a href="mailto:admin@chu.com" className="hover:text-primary transition-colors">admin@chu.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span>+212 684575896</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span>Casablanca, Maroc</span>
                </div>
              </div>
            </div>

          ) : contactType === "hospital" ? (
            /* HOSPITAL FORM */
            <div className="max-w-2xl mx-auto">
              <button onClick={goBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-6 font-medium">
                <ArrowLeft className="h-4 w-4" /> {c.back}
              </button>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-red-700 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{c.iAmHospital}</h2>
                      <p className="text-red-100 text-sm mt-0.5">{c.hospitalDesc}</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleHospitalSubmit} className="p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold text-slate-700">{c.responsibleName}</Label>
                      <Input id="name" required value={hospitalForm.name} onChange={handleHospitalChange} placeholder={c.responsibleName.replace(" *","")} className="h-11 rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-slate-700">{c.professionalEmail}</Label>
                      <Input id="email" type="email" required value={hospitalForm.email} onChange={handleHospitalChange} placeholder="contact@hopital.ma" className="h-11 rounded-xl border-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold text-slate-700">{c.telephone}</Label>
                      <Input id="phone" type="tel" required value={hospitalForm.phone} onChange={handleHospitalChange} placeholder="+212 6XX XXX XXX" className="h-11 rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital_name" className="font-bold text-slate-700">{c.hospitalName}</Label>
                      <Input id="hospital_name" required value={hospitalForm.hospital_name} onChange={handleHospitalChange} placeholder={c.hospitalName.replace(" *","")} className="h-11 rounded-xl border-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-bold text-slate-700">{c.villeStar}</Label>
                      <Input id="city" required value={hospitalForm.city} onChange={handleHospitalChange} placeholder={c.villeStar.replace(" *","")} className="h-11 rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-bold text-slate-700">
                        {c.addressOpt} <span className="text-slate-400 font-normal text-xs">{c.optionalLabel}</span>
                      </Label>
                      <Input id="address" value={hospitalForm.address} onChange={handleHospitalChange} placeholder={c.addressOpt} className="h-11 rounded-xl border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-bold text-slate-700">
                      {c.additionalMessage} <span className="text-slate-400 font-normal text-xs">{c.optionalLabel}</span>
                    </Label>
                    <textarea
                      id="message"
                      value={hospitalForm.message}
                      onChange={handleHospitalChange}
                      className="flex w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm min-h-[100px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={c.additionalMessage}
                    />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">{c.adminNotice}</p>
                  </div>
                  <Button variant="hero" type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2" disabled={isSubmitting}>
                    <Send className="h-5 w-5" />
                    {isSubmitting ? c.sending : c.sendRequest}
                  </Button>
                </form>
              </div>
            </div>

          ) : (
            /* USER FORM */
            <div className="max-w-2xl mx-auto">
              <button onClick={goBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-6 font-medium">
                <ArrowLeft className="h-4 w-4" /> {c.back}
              </button>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-rose-700 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{c.iAmUser}</h2>
                      <p className="text-rose-100 text-sm mt-0.5">{c.userDesc}</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleUserSubmit} className="p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold text-slate-700">{c.yourName}</Label>
                      <Input id="name" required value={userForm.name} onChange={handleUserChange} placeholder={c.yourName.replace(" *","")} className="h-11 rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-slate-700">{c.yourEmail}</Label>
                      <Input id="email" type="email" required value={userForm.email} onChange={handleUserChange} placeholder="votre@email.com" className="h-11 rounded-xl border-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold text-slate-700">
                        {c.telephoneOpt} <span className="text-slate-400 font-normal text-xs">{c.optionalLabel}</span>
                      </Label>
                      <Input id="phone" type="tel" value={userForm.phone} onChange={handleUserChange} placeholder="+212 6XX XXX XXX" className="h-11 rounded-xl border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital_id" className="font-bold text-slate-700">{c.concernedHospital}</Label>
                      <select
                        id="hospital_id"
                        required
                        value={userForm.hospital_id}
                        onChange={(e) => setUserForm({ ...userForm, hospital_id: e.target.value })}
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 transition-all cursor-pointer"
                      >
                        <option value="">{c.selectHospital}</option>
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-bold text-slate-700">
                      {c.subject} <span className="text-slate-400 font-normal text-xs">{c.subjectOptional}</span>
                    </Label>
                    <Input id="subject" value={userForm.subject} onChange={handleUserChange} placeholder={c.subjectPlaceholder} className="h-11 rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-bold text-slate-700">{c.yourMessage}</Label>
                    <textarea
                      id="message"
                      required
                      value={userForm.message}
                      onChange={handleUserChange}
                      className="flex w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm min-h-[120px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={c.messagePlaceholder}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg" disabled={isSubmitting}>
                    <Send className="h-5 w-5" />
                    {isSubmitting ? c.sending : c.sendBtn}
                  </Button>
                </form>
              </div>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  );
}
