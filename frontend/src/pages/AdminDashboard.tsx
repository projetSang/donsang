import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, LogOut, Search, Plus, Trash2, Edit, X, Save, Check, MapPin, Phone, Mail, Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user: adminInfo, logout, loading: authLoading } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    latitude: "",
    longitude: ""
  });
  
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/hospitals");
      setHospitals(data);
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      latitude: "",
      longitude: ""
    });
    setEditingHospitalId(null);
    setErrors({});
  };

  const handleEdit = (hospital: any) => {
    setEditingHospitalId(hospital.id);
    setFormData({
      name: hospital.name || "",
      city: hospital.city || "",
      email: hospital.email || "",
      password: "", // empty means no password update
      address: hospital.address || "",
      phone: hospital.phone || "",
      latitude: hospital.latitude ? String(hospital.latitude) : "",
      longitude: hospital.longitude ? String(hospital.longitude) : ""
    });
    setErrors({});
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet hôpital ? Toutes ses alertes associées seront supprimées.")) return;
    try {
      await apiFetch(`/admin/hospitals/${id}`, {
        method: "DELETE"
      });
      setHospitals(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Succès",
        description: "L'hôpital a été supprimé avec succès."
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la suppression de l'hôpital."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation
    const localErrors: any = {};
    if (!formData.name) localErrors.name = ["Le nom est requis."];
    if (!formData.city) localErrors.city = ["La ville est requise."];
    if (!formData.email) localErrors.email = ["L'email est requis."];
    if (!editingHospitalId && !formData.password) localErrors.password = ["Le mot de passe est requis."];
    
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      const url = editingHospitalId ? `/admin/hospitals/${editingHospitalId}` : "/admin/hospitals";
      const method = editingHospitalId ? "PUT" : "POST";
      
      const payload: any = {
        name: formData.name,
        city: formData.city,
        email: formData.email,
        address: formData.address || null,
        phone: formData.phone || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      toast({
        title: "Succès",
        description: editingHospitalId ? "L'hôpital a été mis à jour avec succès." : "L'hôpital a été enregistré avec succès."
      });

      resetForm();
      setShowAddForm(false);
      fetchHospitals();
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: err.message || "Une erreur s'est produite."
        });
      }
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Building2 className="h-8 w-8 text-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center px-4 relative z-10">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="logo_sang.png" alt="DonSang" width={130} height={130} />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">ESPACE SUPER ADMIN</span>
              <span className="text-[10px] text-primary uppercase tracking-widest font-semibold text-right">
                Gestion des Hôpitaux
              </span>
            </div>
            <div className="h-10 w-10 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-lg font-bold border-2 border-white">
              {"D"}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                Gestion des Hôpitaux
              </h1>
              <p className="text-slate-500 mt-1">Créez, modifiez et gérez les centres hospitaliers affiliés à la plateforme.</p>
            </div>
            
            {!showAddForm && (
              <Button 
                variant="hero" 
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="shadow-lg hover:shadow-primary/20 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Hôpital
              </Button>
            )}
          </div>

          {/* Form Container */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl animate-reveal border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-lg">
                    {editingHospitalId ? "Modifier l'Hôpital" : "Nouveau Centre Hospitalier"}
                  </h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-slate-100" 
                  onClick={() => { setShowAddForm(false); resetForm(); }}
                >
                  <X className="h-4 w-4 text-slate-500" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold">Nom de l'Hôpital *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: CHU Ibn Sina"
                        className={`pl-10 h-12 rounded-xl bg-slate-50 ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 font-semibold">Ville *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Ex: Rabat"
                        className={`pl-10 h-12 rounded-xl bg-slate-50 ${errors.city ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city[0]}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">Adresse Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="contact@hopital.ma"
                        className={`pl-10 h-12 rounded-xl bg-slate-50 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">
                      Mot de passe {editingHospitalId ? "(laissez vide pour ne pas modifier)" : "*"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder={editingHospitalId ? "••••••••" : "Mot de passe sécurisé"}
                        className={`pl-10 h-12 rounded-xl bg-slate-50 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-semibold">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="05 22 00 00 00"
                        className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700 font-semibold">Adresse Complète</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Quartier des Hôpitaux"
                        className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Latitude */}
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-slate-700 font-semibold">Latitude GPS</Label>
                    <Input 
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="Ex: 33.5898"
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>

                  {/* Longitude */}
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-slate-700 font-semibold">Longitude GPS</Label>
                    <Input 
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="Ex: -7.6038"
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="rounded-xl px-6" 
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero"
                    className="rounded-xl px-8 shadow-lg shadow-primary/20"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingHospitalId ? "Enregistrer les modifications" : "Créer le compte"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Table Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un hôpital (Nom, Ville, Email)..."
                className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-base transition-all"
              />
            </div>

            {/* List Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Nom de l'Hôpital</th>
                    <th className="px-6 py-4">Ville</th>
                    <th className="px-6 py-4">Email de contact</th>
                    <th className="px-6 py-4">Téléphone</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        Chargement des hôpitaux...
                      </td>
                    </tr>
                  ) : filteredHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        Aucun hôpital trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredHospitals.map((hospital) => (
                      <tr key={hospital.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{hospital.name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {hospital.city}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{hospital.email}</td>
                        <td className="px-6 py-4 text-slate-600">{hospital.phone || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                              onClick={() => handleEdit(hospital)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-lg"
                              onClick={() => handleDelete(hospital.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
