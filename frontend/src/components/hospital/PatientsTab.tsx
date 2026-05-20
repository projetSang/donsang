import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Edit, User, Search, Filter, Users, Trash2 } from "lucide-react";
import { PatientDetails } from "./PatientDetails";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export function PatientsTab({ showAddPatient, setShowAddPatient }: any) {
  const { user } = useAuth();
  const [showOtherDisease, setShowOtherDisease] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const filteredPatients = patients.filter(p => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      (p.full_name && p.full_name.toLowerCase().includes(lowerTerm)) ||
      (p.cin && p.cin.toLowerCase().includes(lowerTerm)) ||
      (p.id && String(p.id).includes(lowerTerm))
    );
  });
  const [formData, setFormData] = useState({
    hospital_id: 1, // CHU Casablanca par défaut
    full_name: "",
    email: "",
    cin: "",
    birth_date: "",
    phone: "",
    address: "",
    height: "",
    weight: "",
    blood_type: "",
    chronic_diseases: [] as string[],
    other_disease: "",
    allergies: "",
    current_treatments: "",
    medical_history: "",
    admission_date: new Date().toISOString().split('T')[0]
  });

  const toggleDisease = (disease: string) => {
    setFormData(prev => ({
      ...prev,
      chronic_diseases: prev.chronic_diseases.includes(disease)
        ? prev.chronic_diseases.filter(d => d !== disease)
        : [...prev.chronic_diseases, disease]
    }));
  };

  const handleAddPatient = async () => {
    try {
      setErrors({});
      const finalDiseases = [...formData.chronic_diseases];
      if (showOtherDisease && formData.other_disease) {
        finalDiseases.push(formData.other_disease);
      }

      const url = editingPatientId
        ? `http://localhost:8000/api/hospital/patients/${editingPatientId}`
        : "http://localhost:8000/api/hospital/patients";

      const method = editingPatientId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          chronic_diseases: finalDiseases,
          hospital_id: user?.id || 1,
        })
      });

      if (res.ok) {
        const result = await res.json();
        const updatedPatient = editingPatientId ? result : result.patient;

        if (editingPatientId) {
          setPatients(prev => prev.map(p => p.id === editingPatientId ? updatedPatient : p));
        } else {
          setPatients(prev => [...prev, updatedPatient]);
        }

        setShowAddPatient(false);
        setEditingPatientId(null);
        setFormData({
          hospital_id: 1,
          full_name: "",
          email: "",
          cin: "",
          birth_date: "",
          phone: "",
          address: "",
          height: "",
          weight: "",
          chronic_diseases: [],
          other_disease: "",
          allergies: "",
          current_treatments: "",
          medical_history: "",
          blood_type: "",
          admission_date: new Date().toISOString().split('T')[0]
        });
        setShowOtherDisease(false);
      } else if (res.status === 422) {
        const errorData = await res.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          setTimeout(() => {
            const formElement = document.getElementById("patient-form");
            if (formElement) {
              formElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 50);
        }
      } else {
        console.error("Server error", res.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePatient = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce dossier ?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/hospital/patients/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        setPatients(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (e: React.MouseEvent, patient: any) => {
    e.stopPropagation();
    setErrors({});
    setEditingPatientId(patient.id);
    setFormData({
      hospital_id: patient.hospital_id ?? 1,
      full_name: patient.full_name ?? "",
      email: patient.email ?? "",
      cin: patient.cin ?? "",
      birth_date: patient.birth_date ?? "",
      phone: patient.phone ?? "",
      address: patient.address ?? "",
      height: patient.height ?? "",
      weight: patient.weight ?? "",
      blood_type: patient.blood_type ?? "",
      chronic_diseases: Array.isArray(patient.chronic_diseases) ? patient.chronic_diseases : JSON.parse(patient.chronic_diseases || "[]"),
      other_disease: "",
      allergies: patient.allergies ?? "",
      current_treatments: patient.current_treatments ?? "",
      medical_history: patient.medical_history ?? "",
      admission_date: patient.admission_date ?? new Date().toISOString().split('T')[0]
    });
    setShowAddPatient(true);
  };

  const resetForm = () => {
    setEditingPatientId(null);
    setErrors({});
    setFormData({
      hospital_id: user?.id || 1,
      full_name: "",
      email: "",
      cin: "",
      birth_date: "",
      phone: "",
      address: "",
      height: "",
      weight: "",
      blood_type: "",
      chronic_diseases: [],
      other_disease: "",
      allergies: "",
      current_treatments: "",
      medical_history: "",
      admission_date: new Date().toISOString().split('T')[0]
    });
    setShowOtherDisease(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:8000/api/hospital/patients?hospital_id=${user.id}`)
        .then(res => res.json())
        .then(data => setPatients(data))
        .catch(console.error);
    }
  }, [user]);

  if (selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="animate-reveal">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Gestion des Patients
          </h1>
          <p className="text-slate-500 mt-1">Consultez et gérez les dossiers médicaux des patients.</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => { resetForm(); setShowAddPatient(true); }} className="shadow-lg hover:shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Patient
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un patient (Nom, CIN)..."
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      {showAddPatient && (
        <div id="patient-form" className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-xl animate-reveal border-t-4 border-t-primary">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-accent text-primary rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-lg">{editingPatientId ? "Modifier le Dossier" : "Nouveau Dossier Patient"}</h4>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl mb-6 font-bold animate-reveal">
              {Object.keys(errors).some(k => !["full_name", "cin", "email", "birth_date", "phone", "address", "height", "weight", "blood_type"].includes(k)) ? (
                <div>
                  <p className="mb-2">Certains champs requis ou paramètres du serveur sont invalides :</p>
                  <ul className="list-disc pl-5 font-normal">
                    {Object.entries(errors).map(([key, messages]) => (
                      <li key={key}>{key} : {messages.join(", ")}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                "Veuillez corriger les erreurs ci-dessous avant de soumettre le formulaire."
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <Input 
                placeholder="entre votre nom" 
                className={`bg-muted/30 focus:bg-background ${errors.full_name && errors.full_name.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.full_name} 
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  if (errors.full_name) {
                    setErrors(prev => ({ ...prev, full_name: [] }));
                  }
                }} 
              />
              {errors.full_name && errors.full_name.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">CIN </label>
              <Input 
                placeholder="entre votre CIN" 
                className={`bg-muted/30 focus:bg-background ${errors.cin && errors.cin.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.cin} 
                onChange={(e) => {
                  setFormData({ ...formData, cin: e.target.value });
                  if (errors.cin) {
                    setErrors(prev => ({ ...prev, cin: [] }));
                  }
                }} 
              />
              {errors.cin && errors.cin.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.cin[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input 
                type="email" 
                placeholder="email@exemple.com" 
                className={`bg-muted/30 focus:bg-background ${errors.email && errors.email.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.email} 
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: [] }));
                  }
                }} 
              />
              {errors.email && errors.email.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
              <Input 
                type="date" 
                className={`bg-muted/30 focus:bg-background ${errors.birth_date && errors.birth_date.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.birth_date} 
                onChange={(e) => {
                  setFormData({ ...formData, birth_date: e.target.value });
                  if (errors.birth_date) {
                    setErrors(prev => ({ ...prev, birth_date: [] }));
                  }
                }} 
              />
              {errors.birth_date && errors.birth_date.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.birth_date[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <Input 
                placeholder="entre votre numéro téléphone" 
                className={`bg-muted/30 focus:bg-background ${errors.phone && errors.phone.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.phone} 
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) {
                    setErrors(prev => ({ ...prev, phone: [] }));
                  }
                }} 
              />
              {errors.phone && errors.phone.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Adresse</label>
              <Input 
                placeholder="entre votre adresse" 
                className={`bg-muted/30 focus:bg-background ${errors.address && errors.address.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.address} 
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) {
                    setErrors(prev => ({ ...prev, address: [] }));
                  }
                }} 
              />
              {errors.address && errors.address.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.address[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Taille (cm)</label>
              <Input 
                type="number" 
                placeholder="entre votre taille" 
                className={`bg-muted/30 focus:bg-background ${errors.height && errors.height.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.height} 
                onChange={(e) => {
                  setFormData({ ...formData, height: e.target.value });
                  if (errors.height) {
                    setErrors(prev => ({ ...prev, height: [] }));
                  }
                }} 
              />
              {errors.height && errors.height.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.height[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Poids (kg)</label>
              <Input 
                type="number" 
                placeholder="entre votre poids" 
                className={`bg-muted/30 focus:bg-background ${errors.weight && errors.weight.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : 'border-transparent'}`} 
                value={formData.weight} 
                onChange={(e) => {
                  setFormData({ ...formData, weight: e.target.value });
                  if (errors.weight) {
                    setErrors(prev => ({ ...prev, weight: [] }));
                  }
                }} 
              />
              {errors.weight && errors.weight.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.weight[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Groupe sanguin</label>
              <select 
                className={`h-11 w-full rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat ${errors.blood_type && errors.blood_type.length > 0 ? 'border-red-500 focus:ring-red-500' : 'border-transparent'}`}
                value={formData.blood_type}
                onChange={(e) => {
                  setFormData({ ...formData, blood_type: e.target.value });
                  if (errors.blood_type) {
                    setErrors(prev => ({ ...prev, blood_type: [] }));
                  }
                }}
              >
                <option value="">Sélectionner</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.blood_type && errors.blood_type.length > 0 && (
                <p className="text-xs text-red-500 mt-1">{errors.blood_type[0]}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-foreground">Maladies chroniques</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Diabète", "Cardiaque", "Hypertension", "Asthme"].map(disease => (
                  <label key={disease} className="flex items-center gap-2 text-sm p-3 rounded-xl border border-border bg-muted/20 hover:bg-accent/30 hover:border-primary/30 transition-all cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded-full border-slate-300 text-primary focus:ring-primary" checked={formData.chronic_diseases.includes(disease)} onChange={() => toggleDisease(disease)} />
                    {disease}
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm p-3 rounded-xl border border-border bg-muted/20 hover:bg-accent/30 hover:border-primary/30 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-full border-slate-300 text-primary focus:ring-primary"
                    checked={showOtherDisease}
                    onChange={(e) => setShowOtherDisease(e.target.checked)}
                  />
                  Autre
                </label>
              </div>
              {showOtherDisease && (
                <div className="mt-4 animate-reveal">
                  <textarea
                    placeholder="Veuillez préciser ici..."
                    className="flex w-full rounded-xl border border-input bg-muted/30 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    rows={3}
                    value={formData.other_disease}
                    onChange={(e) => setFormData({ ...formData, other_disease: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-3 space-y-4 pt-4 border-t border-border">
              <h5 className="font-bold text-foreground">Autres informations médicales</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                  <textarea
                    placeholder="Ex: Pénicilline, Arachides..."
                    className="flex w-full rounded-xl border border-input bg-muted/30 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                    value={formData.allergies || ""}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Traitements en cours</label>
                  <textarea
                    placeholder="Ex: Insuline, Paracétamol..."
                    className="flex w-full rounded-xl border border-input bg-muted/30 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                    value={formData.current_treatments || ""}
                    onChange={(e) => setFormData({ ...formData, current_treatments: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Antécédents médicaux</label>
                  <textarea
                    placeholder="Ex: Appendicectomie (2019)..."
                    className="flex w-full rounded-xl border border-input bg-muted/30 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                    value={formData.medical_history || ""}
                    onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" className="rounded-xl px-6" onClick={() => {
              setShowAddPatient(false);
              resetForm();
            }}>Annuler</Button>
            <Button variant="hero" className="rounded-xl px-8 shadow-lg shadow-primary/20" onClick={handleAddPatient}>
              {editingPatientId ? "Enregistrer les modifications" : "Créer le dossier"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">numéro dossier</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom Patient</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Groupe</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors group cursor-pointer" onClick={() => setSelectedPatient(p)}>
                  <td className="p-4 font-mono text-sm text-muted-foreground">N{p.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{p.full_name}</div>

                  </td>
                  <td className="p-4">
                    <span className="bg-accent text-primary px-3 py-1 rounded-full font-bold text-xs shadow-sm border border-primary/10">
                      {p.blood_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{p.admission_date}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg hover:bg-primary hover:text-white transition-all" onClick={() => setSelectedPatient(p)}>
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Détails
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg hover:bg-blue-600 hover:text-white transition-all border-blue-200" onClick={(e) => startEdit(e, p)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg hover:bg-gray-600 hover:text-white transition-all border-gray-200" onClick={(e) => handleDeletePatient(e, p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Aucun patient trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

