import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Mail, MapPin, Phone, Lock, Save, Globe, Shield } from "lucide-react";

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    email: "",
    address: "",
    phone: "",
    password: ""
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/hospital/settings")
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name || "",
          city: data.city || "",
          email: data.email || "",
          address: data.address || "",
          phone: data.phone || "",
          password: "" 
        });
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:8000/api/hospital/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-reveal">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Paramètres de l'établissement
        </h1>
        <p className="text-slate-500">Gérez les informations de votre hôpital et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 className="h-5 w-5 text-primary" />
              Informations Générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Nom de l'hôpital</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ville</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Adresse complète</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                  <textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[60px] text-sm"
                    placeholder="Adresse de l'hôpital"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email de contact</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 border-t-4 border-t-amber-400">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Lock className="h-5 w-5 text-amber-500" />
              Sécurité du compte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password"
                    placeholder="Laissez vide pour ne pas changer"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                  />
                </div>
                <p className="text-[11px] text-slate-400 ml-1 mt-1 italic">Utilisez au moins 8 caractères avec des chiffres et symboles.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800">Visibilité Publique</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ces informations seront visibles par les donneurs sur l'application mobile pour les aider à vous localiser et vous contacter.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
            <h4 className="font-bold">Actions de sauvegarde</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assurez-vous que toutes les données sont correctes avant d'enregistrer les modifications.
            </p>
            <Button 
              className={`w-full h-12 rounded-xl font-bold flex gap-2 transition-all ${success ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                "Sauvegarde..."
              ) : success ? (
                <>Success !</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
