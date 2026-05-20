import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, Phone, Mail, Calendar, Edit2, X , Crown, Award, Droplets } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function SearchTab({ selectedBlood, setSelectedBlood, city, setCity }: any) {
  const { user } = useAuth();
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDonor, setEditingDonor] = useState<any>(null);
  const [newDonationDate, setNewDonationDate] = useState("");
  const [radius, setRadius] = useState("");

  const handleSearch = useCallback(() => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      blood_type: selectedBlood,
      city: city,
      radius: radius
    });
    if (user?.id) {
      queryParams.append("hospital_id", String(user.id));
    }

    fetch(`http://localhost:8000/api/hospital/search-donors?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setDonors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Search error:", err);
        setLoading(false);
      });
  }, [selectedBlood, city, radius]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleUpdateDate = () => {
    if (!editingDonor) return;

    fetch(`http://localhost:8000/api/hospital/donors/${editingDonor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingDonor, last_donation_date: newDonationDate })
    })
      .then(res => res.json())
      .then(updatedDonor => {
        setDonors(donors.map(d => (d.id === updatedDonor.id && d.is_patient === updatedDonor.is_patient) ? updatedDonor : d));
        setEditingDonor(null);
      })
      .catch(console.error);
  };

    

  return (
    <div className="space-y-6 animate-reveal">
      {/* Search Header and Filters */}
       <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Search className="h-8 w-8 text-primary" />
              Recherche de Donneurs
            </h1>
            <p className="text-slate-500 mt-1">Trouvez les donneurs disponibles dans votre région.</p>
          </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Groupe sanguin</label>
              <select
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={selectedBlood}
                onChange={(e) => setSelectedBlood(e.target.value)}
              >
                <option value="">Sélectionner</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Ville</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="h-11 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Entrez la ville"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Rayon (km)</label>
              <select
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="hero" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 flex gap-2" onClick={handleSearch} disabled={loading}>
                <Search className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-800">
            {donors.length} {donors.length === 1 ? 'donneur' : 'donneurs'} {selectedBlood} trouvés à {city}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {donors.length > 0 ? (() => {
            const maxDonations = Math.max(...donors.map(d => d.donations_count || 0), 0);
            return donors.map((donor, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${donor.donations_count === maxDonations && maxDonations > 0 ? 'border-amber-400 shadow-amber-100/50' : 'border-slate-200'} p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group relative overflow-hidden`}>
              {donor.donations_count === maxDonations && maxDonations > 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <Crown className="h-3.5 w-3.5" /> L'Héro (Roi)
                </div>
              )}
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all duration-300 ${
                  donor.donations_count === maxDonations && maxDonations > 0
                    ? 'bg-amber-100 text-amber-600 border-amber-300 group-hover:bg-amber-500 group-hover:text-white'
                    : 'bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white'
                }`}>
                  {donor.blood_type}
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    {donor.full_name}
                    {donor.donations_count > 0 && (() => {
                      let badgeStyle = "bg-orange-50 text-orange-600 border-orange-200";
                      let title = "Bronze";
                      if (donor.donations_count >= 6) {
                        badgeStyle = "bg-amber-50 text-amber-600 border-amber-200 font-semibold";
                        title = "Or";
                      } else if (donor.donations_count >= 3) {
                        badgeStyle = "bg-slate-100 text-slate-600 border-slate-250";
                        title = "Argent";
                      }
                      return (
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badgeStyle} shadow-sm`}>
                          <Award className="h-3.5 w-3.5" /> {donor.donations_count} {donor.donations_count > 1 ? 'dons' : 'don'} ({title})
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-1.5">
                    <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href = `tel:${donor.phone}`}>
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {donor.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {donor.city} {donor.distance && <span className="text-primary font-bold">({Math.round(donor.distance)} km)</span>}
                    </div>
                    
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-primary transition-all gap-2"
                  onClick={() => {
                    setEditingDonor({ ...donor, donations_count: (donor.donations_count || 0) + 1 });
                    setNewDonationDate(new Date().toISOString().split('T')[0]);
                  }}
                >
                  <Edit2 className="h-4 w-4 " />
                  modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1  sm:flex-none h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-primary transition-all gap-2"
                  onClick={() => donor.email ? window.location.href = `mailto:${donor.email}` : alert("Email non disponible")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  className="flex-1 sm:flex-none h-11 rounded-xl shadow-lg shadow-primary/10 gap-2"
                  onClick={() => window.location.href = `tel:${donor.phone}`}
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </Button>
              </div>
            </div>
          ));
          })() : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h4 className="text-slate-900 font-bold text-lg">Aucun donneur trouvé</h4>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Essayez de modifier votre recherche ou de sélectionner un autre groupe sanguin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDonor} onOpenChange={() => setEditingDonor(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Edit2 className="h-6 w-6 text-primary" />
              Modifier le Donneur
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nom complet</label>
              <Input
                value={editingDonor?.full_name || ""}
                onChange={(e) => setEditingDonor({ ...editingDonor, full_name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Date du dernier don</label>
              <Input
                type="date"
                value={newDonationDate}
                onChange={(e) => setNewDonationDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Points (Nombre de dons)</label>
              <Input
                type="number"
                value={editingDonor?.donations_count || 0}
                onChange={(e) => setEditingDonor({ ...editingDonor, donations_count: parseInt(e.target.value) || 0 })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingDonor(null)} className="rounded-xl">Annuler</Button>
            <Button variant="hero" onClick={handleUpdateDate} className="rounded-xl">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
