import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Edit2, Crown, Award, CreditCard, Mail, MessageCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, apiUrl } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function SearchTab({ selectedBlood, setSelectedBlood, city, setCity }: any) {
  const { user } = useAuth();
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDonor, setEditingDonor] = useState<any>(null);
  const [newDonationDate, setNewDonationDate] = useState("");
  const [cinSearch, setCinSearch] = useState("");
// pour le message WhatsApp
  const getWhatsappUrl = (donor: any) => {
    let phone = String(donor.phone || "").replace(/\D/g, "");

    if (phone.startsWith("0") && phone.length === 10) {
      phone = `212${phone.slice(1)}`;
    }

    const hospitalName = user?.name || "notre hopital";
    const donorCity = donor.city || "votre ville";
    const siteUrl = `${globalThis.location.origin}/`;
    const message = `Bonjour ${donor.full_name} 👋
   ${hospitalName} vous contacte pour un besoin urgent en sang ${donor.blood_type} 🩸
📍 Ville : ${donorCity}
🔗 Plateforme : ${siteUrl}
    Merci de nous repondre des que possible pour nous confirmer votre disponibilite.
    Cordialement,
    ${hospitalName}`;

    const params = new URLSearchParams({
      phone,
      text: message,
    });

    return `https://api.whatsapp.com/send?${params.toString()}`;
  };

  const handleSearch = useCallback(() => {
    setLoading(true);

    const normalizedCin = cinSearch.trim().toUpperCase();
    const queryParams = new URLSearchParams();

    if (selectedBlood) {
      queryParams.append("blood_type", selectedBlood);
    }
    if (city.trim()) {
      queryParams.append("city", city.trim());
    }
    if (normalizedCin) {
      queryParams.append("cin", normalizedCin);
    }
    if (user?.id) {
      queryParams.append("hospital_id", String(user.id));
    }

    apiFetch(`/hospital/search-donors?${queryParams.toString()}`)
      .then(data => {
        setDonors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Search error:", err);
        setLoading(false);
      });
  }, [selectedBlood, city, cinSearch, user?.id]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleUpdateDate = () => {
    if (!editingDonor) return;

    fetch(apiUrl(`/hospital/donors/${editingDonor.id}`), {
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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          Recherche de Donneurs
        </h1>
        <p className="text-slate-500 mt-1">Trouvez les donneurs disponibles dans votre région.</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-6">

          {/* Row 1: Blood type, City, CIN, Search button */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="filter-blood" className="text-sm font-bold text-slate-700 ml-1">Groupe sanguin</label>
              <select
                id="filter-blood"
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
              <label htmlFor="city" className="text-sm font-bold text-slate-700 ml-1">Ville</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="city"
                  className="h-11 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Entrez la ville"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cin" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
                CIN
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="cin"
                  className="h-11 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                  value={cinSearch}
                  onChange={(e) => setCinSearch(e.target.value.toUpperCase())}
                  placeholder="CIN du donneur..."
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="hero"
                className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 flex gap-2"
                onClick={handleSearch}
                disabled={loading}
              >
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
            {cinSearch
              ? `${donors.length} résultat(s) pour CIN: ${cinSearch}`
              : `${donors.length} ${donors.length === 1 ? 'donneur' : 'donneurs'} ${selectedBlood || ''} trouvés ${city ? `à ${city}` : ''}`
            }
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {donors.length > 0 ? (() => {
            const maxDonations = Math.max(...donors.map(d => d.donations_count || 0), 0);
            return donors.map((donor, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border ${
                  donor.donations_count === maxDonations && maxDonations > 0
                    ? 'border-amber-400 shadow-amber-100/50'
                    : 'border-slate-200'
                } p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group relative overflow-hidden`}
              >
                {/* Hero badge */}
                {donor.donations_count === maxDonations && maxDonations > 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                    <Crown className="h-3.5 w-3.5" /> L'Héro (Roi)
                  </div>
                )}

                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all duration-300 ${
                    donor.donations_count === maxDonations && maxDonations > 0
                      ? 'bg-amber-100 text-amber-600 border-amber-300 group-hover:bg-amber-500 group-hover:text-white'
                      : 'bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white'
                  }`}>
                    {donor.blood_type}
                  </div>

                  <div>
                    {/* Name + badge */}
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

                    {/* Details row */}
                    <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-1.5">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => globalThis.location.href = `tel:${donor.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {donor.phone}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {donor.city}
                      </div>
                      {donor.cin && (
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md">{donor.cin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                  <Button
                    variant="hero"
                    size="sm"
                    className="h-9 w-9 rounded-lg p-0 shadow-md shadow-primary/10"
                    onClick={() => {
                      setEditingDonor({ ...donor, donations_count: (donor.donations_count || 0) + 1 });
                      setNewDonationDate(new Date().toISOString().split('T')[0]);
                    }}
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 rounded-lg border-slate-200 bg-white p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all"
                    onClick={() => globalThis.open(getWhatsappUrl(donor), "_blank")}
                    disabled={!donor.phone}
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 rounded-lg border-slate-200 bg-white p-0 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-all"
                    onClick={() => globalThis.location.href = `mailto:${donor.email}`}
                    disabled={!donor.email}
                    title="Email"
                  >
                    <Mail className="h-3.5 w-3.5" />
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
            <DialogDescription className="text-sm text-slate-500 mt-1">Modifiez les informations du donneur ci-dessous.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-bold text-slate-700">Nom complet</label>
              <Input id="full_name"
                value={editingDonor?.full_name || ""}
                onChange={(e) => setEditingDonor({ ...editingDonor, full_name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="donor_cin" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-slate-400" />
                CIN <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
              </label>
              <Input id="donor_cin"
                value={editingDonor?.cin || ""}
                onChange={(e) => setEditingDonor({ ...editingDonor, cin: e.target.value })}
                placeholder="Ex: AB123456"
                className="rounded-xl font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="donation_date" className="text-sm font-bold text-slate-700">Date du dernier don</label>
              <Input id="donation_date"
                type="date"
                value={newDonationDate}
                onChange={(e) => setNewDonationDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="donations_count" className="text-sm font-bold text-slate-700">Points (Nombre de dons)</label>
              <Input id="donations_count"
                type="number"
                value={editingDonor?.donations_count || 0}
                onChange={(e) => setEditingDonor({ ...editingDonor, donations_count: Number.parseInt(e.target.value) || 0 })}
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
