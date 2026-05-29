import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, LogOut, Search, Plus, Trash2, Edit, X, Save, Check, MapPin, Phone, Mail, Lock,
  MessageSquare, Clock, CheckCircle2, XCircle, Eye, EyeOff, Copy, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [hospitalRequests, setHospitalRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const generateSecurePassword = () => {
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const numbers = "23456789";
    const symbols = "!@#$%&*?+=-";
    
    let password = "";
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleAddNew = () => {
    resetForm();
    const newPass = generateSecurePassword();
    setFormData(prev => ({
      ...prev,
      password: newPass
    }));
    setShowPassword(true);
    setShowAddForm(true);
  };

  const handleCreateAccountFromRequest = (req: any) => {
    const generatedPass = generateSecurePassword();
    setFormData({
      name: req.hospital_name || req.name || "",
      city: req.city || "",
      email: req.email || "",
      password: generatedPass,
      address: req.address || "",
      phone: req.phone || "",
      latitude: "",
      longitude: ""
    });
    setEditingHospitalId(null);
    setErrors({});
    setShowPassword(true);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
      title: t.adminDashboard.formPrefilled,
      description: t.adminDashboard.formPrefilledDesc
    });
  };

  useEffect(() => {
    fetchHospitals();
    fetchHospitalRequests();
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

  const fetchHospitalRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await fetch('https://backend-production-4a57.up.railway.app/api/hospital/contact-messages?type=hospital');
      const data = await res.json();
      setHospitalRequests(data);
    } catch (err) {
      console.error('Failed to fetch hospital requests', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestStatus = async (id: number, status: string) => {
    try {
      await fetch(`https://backend-production-4a57.up.railway.app/api/contact-messages/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setHospitalRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast({
        title: status === 'approved' ? t.adminDashboard.requestApproved : t.adminDashboard.requestRejected,
        description: status === 'approved' ? t.adminDashboard.requestApprovedDesc : t.adminDashboard.requestRejectedDesc
      });
    } catch (err) {
      toast({ variant: 'destructive', title: t.adminDashboard.error, description: t.adminDashboard.updateStatusError });
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
    if (!confirm(t.adminDashboard.deleteConfirm)) return;
    try {
      await apiFetch(`/admin/hospitals/${id}`, {
        method: "DELETE"
      });
      setHospitals(prev => prev.filter(h => h.id !== id));
      toast({
        title: t.adminDashboard.success,
        description: t.adminDashboard.deleteSuccess
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.adminDashboard.error,
        description: err.message || t.adminDashboard.deleteError
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation
    const localErrors: any = {};
    if (!formData.name) localErrors.name = [t.adminDashboard.nameRequired];
    if (!formData.city) localErrors.city = [t.adminDashboard.cityRequired];
    if (!formData.email) localErrors.email = [t.adminDashboard.emailRequired];
    if (!editingHospitalId && !formData.password) localErrors.password = [t.adminDashboard.passwordRequired];
    
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
        title: t.adminDashboard.success,
        description: editingHospitalId ? t.adminDashboard.updateSuccess : t.adminDashboard.createSuccess
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
          title: t.adminDashboard.error,
          description: err.message || t.adminDashboard.errorOccurred
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
              <span className="text-sm font-bold text-slate-900">{t.adminDashboard.superAdmin}</span>
              <span className="text-[10px] text-primary uppercase tracking-widest font-semibold text-right">
                {t.adminDashboard.hospitalManagement}
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
                {t.adminDashboard.hospitalManagement}
              </h1>
              <p className="text-slate-500 mt-1">{t.adminDashboard.hospitalManagementDesc}</p>
            </div>
            
            {!showAddForm && (
              <Button 
                variant="hero" 
                onClick={handleAddNew}
                className="shadow-lg hover:shadow-primary/20 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.adminDashboard.addHospital}
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
                    {editingHospitalId ? t.adminDashboard.editHospital : t.adminDashboard.newHospitalCenter}
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
                    <Label htmlFor="name" className="text-slate-700 font-semibold">{t.adminDashboard.hospitalName}</Label>
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
                    <Label htmlFor="city" className="text-slate-700 font-semibold">{t.adminDashboard.city}</Label>
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
                    <Label htmlFor="email" className="text-slate-700 font-semibold">{t.adminDashboard.emailAddress}</Label>
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
                      {t.adminDashboard.password} {editingHospitalId ? t.adminDashboard.passwordLeaveEmpty : "*"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder={editingHospitalId ? "••••••••" : t.adminDashboard.securePassword}
                        className={`pl-10 pr-24 h-12 rounded-xl bg-slate-50 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {formData.password && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                            onClick={() => {
                              navigator.clipboard.writeText(formData.password);
                              toast({
                                title: t.adminDashboard.copied,
                                description: t.adminDashboard.copiedDesc
                              });
                            }}
                            title={t.adminDashboard.copied}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                          onClick={() => {
                            const newPass = generateSecurePassword();
                            setFormData({...formData, password: newPass});
                            setShowPassword(true);
                            toast({
                              title: t.adminDashboard.passwordGenerated,
                              description: t.adminDashboard.passwordGeneratedDesc
                            });
                          }}
                          title={t.adminDashboard.passwordGenerated}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? t.adminDashboard.hide : t.adminDashboard.show}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-semibold">{t.adminDashboard.phone}</Label>
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
                    <Label htmlFor="address" className="text-slate-700 font-semibold">{t.adminDashboard.fullAddress}</Label>
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


                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="rounded-xl px-6" 
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                  >
                    {t.adminDashboard.cancel}
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero"
                    className="rounded-xl px-8 shadow-lg shadow-primary/20"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingHospitalId ? t.adminDashboard.saveChanges : t.adminDashboard.createAccount}
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
                placeholder={t.adminDashboard.searchPlaceholder}
                className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-base transition-all"
              />
            </div>

            {/* List Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">{t.adminDashboard.hospitalNameCol}</th>
                    <th className="px-6 py-4">{t.adminDashboard.cityCol}</th>
                    <th className="px-6 py-4">{t.adminDashboard.contactEmail}</th>
                    <th className="px-6 py-4">{t.adminDashboard.phoneCol}</th>
                    <th className="px-6 py-4 text-center">{t.adminDashboard.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        {t.adminDashboard.loadingHospitals}
                      </td>
                    </tr>
                  ) : filteredHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        {t.adminDashboard.noHospitalFound}
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

          {/* Hospital Requests Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t.adminDashboard.hospitalRequests}</h2>
                  <p className="text-xs text-slate-500">{t.adminDashboard.requestsDesc}</p>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                {hospitalRequests.filter(r => r.status === 'pending').length} {t.adminDashboard.pending}
              </span>
            </div>

            {requestsLoading ? (
              <div className="text-center py-8 text-slate-400">{t.adminDashboard.loadingRequests}</div>
            ) : hospitalRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">{t.adminDashboard.noRequests}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hospitalRequests.map((req) => (
                  <div key={req.id} className={`rounded-xl border transition-all ${
                    req.status === 'pending' ? 'border-amber-200 bg-amber-50/30' :
                    req.status === 'approved' ? 'border-emerald-200 bg-emerald-50/30' :
                    'border-slate-200 bg-slate-50/30'
                  }`}>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{req.hospital_name || t.adminDashboard.unknownHospital}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{req.email}</span>
                            {req.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.city}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'pending' ? t.adminDashboard.statusPending : req.status === 'approved' ? t.adminDashboard.statusApproved : t.adminDashboard.statusRejected}
                        </span>
                        {expandedRequest === req.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>

                    {expandedRequest === req.id && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-400 text-xs">{t.adminDashboard.responsible}</span><br/><span className="font-semibold text-slate-700">{req.name}</span></div>
                          <div><span className="text-slate-400 text-xs">{t.adminDashboard.phoneLabel}</span><br/><span className="font-semibold text-slate-700">{req.phone || '—'}</span></div>
                          <div><span className="text-slate-400 text-xs">{t.adminDashboard.cityLabel}</span><br/><span className="font-semibold text-slate-700">{req.city || '—'}</span></div>
                          <div><span className="text-slate-400 text-xs">{t.adminDashboard.addressLabel}</span><br/><span className="font-semibold text-slate-700">{req.address || '—'}</span></div>
                        </div>
                        {req.message && (
                          <div className="bg-white rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">{t.adminDashboard.messageLabel}</p>
                            <p className="text-sm text-slate-700">{req.message}</p>
                          </div>
                        )}
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                              onClick={(e) => { e.stopPropagation(); handleRequestStatus(req.id, 'approved'); }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> {t.adminDashboard.approve}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 gap-1.5 h-9"
                              onClick={(e) => { e.stopPropagation(); handleRequestStatus(req.id, 'rejected'); }}
                            >
                              <XCircle className="h-3.5 w-3.5" /> {t.adminDashboard.reject}
                            </Button>
                          </div>
                        )}
                        {req.status === 'approved' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="rounded-lg bg-primary hover:bg-primary/95 text-white gap-1.5 h-9"
                              onClick={(e) => { e.stopPropagation(); handleCreateAccountFromRequest(req); }}
                            >
                              <Plus className="h-3.5 w-3.5" /> {t.adminDashboard.createHospitalAccount}
                            </Button>
                          </div>
                        )}
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
