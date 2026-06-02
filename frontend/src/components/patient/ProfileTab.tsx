import { useEffect, useState } from "react";
import { User, Lock, AlertTriangle, MapPin, Navigation, Crown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Fix missing marker icons for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface ProfileTabProps {
  profileData: any;
  setProfileData: (data: any) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileLoading: boolean;
  profileSuccess: string;
  profileError: string;
  passwords: any;
  setPasswords: (data: any) => void;
  handleUpdatePassword: (e: React.FormEvent) => void;
  passLoading: boolean;
  passSuccess: string;
  passError: string;
  onViewCertificate?: () => void;
}

export function ProfileTab({
  profileData,
  setProfileData,
  handleUpdateProfile,
  profileLoading,
  profileSuccess,
  profileError,
  passwords,
  setPasswords,
  handleUpdatePassword,
  passLoading,
  passSuccess,
  passError,
  onViewCertificate
}: ProfileTabProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const dashboardT = t.patientDashboard;
  const [showMap, setShowMap] = useState(false);

  const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom]);
    return null;
  };

  const handleGetCurrentGPSLocation = () => {
    if (!navigator.geolocation) { // NOSONAR
      alert(dashboardT.gpsNotSupported);
      return;
    }

    navigator.geolocation.getCurrentPosition( // NOSONAR
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();

          setProfileData({
            ...profileData,
            latitude: lat,
            longitude: lon,
            address: data.display_name || profileData.address
          });

          setShowMap(true);
          toast({
            title: dashboardT.gpsSuccess,
            description: dashboardT.gpsSuccessDesc
          });
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setProfileData({
            ...profileData,
            latitude: lat,
            longitude: lon
          });
          setShowMap(true);
          toast({
            title: dashboardT.gpsSuccess,
            description: dashboardT.gpsSuccessNoAddr
          });
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        alert(dashboardT.gpsError);
      }
    );
  };

  const handleGetLocation = async () => {
    if (!profileData?.address) {
      alert(dashboardT.enterAddrFirst);
      return;
    }
    
    try {
      // Use OpenStreetMap Nominatim API to geocode the address
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profileData.address)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setProfileData({
          ...profileData,
          latitude: Number.parseFloat(data[0].lat),
          longitude: Number.parseFloat(data[0].lon)
        });
        setShowMap(true);
        toast({
          title: dashboardT.addrLocalized,
          description: dashboardT.addrCentered
        });
      } else {
        alert(dashboardT.addrNotFound);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      alert(dashboardT.addrSearchError);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      async click(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        
        try {
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();
          
          setProfileData({
            ...profileData,
            latitude: lat,
            longitude: lon,
            address: data.display_name || profileData.address // Update address if found
          });
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          // Still update location even if address fetch fails
          setProfileData({
            ...profileData,
            latitude: lat,
            longitude: lon
          });
        }
      },
    });

    return profileData?.latitude && profileData?.longitude ? (
      <Marker position={[profileData.latitude, profileData.longitude]}>
        <Popup>{dashboardT.selectedPos}</Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">{dashboardT.profile}</h2>
        {profileData?.donations_count > 0 && (
          <>
            <span className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 font-semibold shadow-sm animate-reveal">
              <Award className="h-4 w-4" /> {profileData.donations_count} {profileData.donations_count > 1 ? dashboardT.donations : dashboardT.donation}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onViewCertificate}
              className="text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-white rounded-full h-8 px-3 shadow-sm flex items-center gap-1 transition-all"
            >
              {dashboardT.viewMyCert}
            </Button>
          </>
        )}
        {profileData?.is_king && (
          <span className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-amber-400 to-amber-200 text-amber-950 px-3 py-1 rounded-full border border-amber-300 font-extrabold shadow-sm animate-pulse">
            <Crown className="h-4 w-4 text-amber-800 animate-bounce" /> {dashboardT.heroKing}
          </span>
        )}
      </div>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        {profileError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg font-bold">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg font-bold">
            {profileSuccess}
          </div>
        )}
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.fullName}</label>
              <Input 
                value={profileData?.full_name || ""} 
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.email}</label>
              <Input 
                value={profileData?.email || ""} 
                readOnly
                className="mt-1 bg-muted/30" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.phone}</label>
              <Input 
                value={profileData?.phone || ""} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.cityAddress}</label>
              <Input 
                value={profileData?.address || ""} 
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.birthDate}</label>
              <Input 
                type="date" 
                value={profileData?.birth_date || ""} 
                onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{dashboardT.bloodType}</label>
              <select 
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profileData?.blood_type || ""}
                onChange={(e) => setProfileData({...profileData, blood_type: e.target.value})}
              >
                <option value="Non spécifié" disabled>{dashboardT.select}</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">{dashboardT.gpsLocation}</p>
                <p className="text-xs text-slate-500">{dashboardT.gpsDesc}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetCurrentGPSLocation}
                className="w-full md:w-auto rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Navigation className="h-4 w-4" />
                {dashboardT.gpsAuto}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetLocation}
                className="w-full md:w-auto rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-all"
              >
                {dashboardT.searchAddress}
              </Button>
            </div>
          </div>

          {showMap && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border h-64 z-0 relative">
              <div className="absolute top-2 right-2 z-[400] bg-white/90 text-xs px-2 py-1 rounded shadow pointer-events-none font-medium">
                {profileData?.latitude && profileData?.longitude 
                  ? dashboardT.adjustPosition 
                  : dashboardT.definePosition}
              </div>
              <MapContainer 
                center={profileData?.latitude && profileData?.longitude 
                  ? [profileData.latitude, profileData.longitude] 
                  : [33.9716, -6.8498]}
                zoom={profileData?.latitude && profileData?.longitude ? 14 : 6} 
                className="h-full w-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
                <ChangeView 
                  center={profileData?.latitude && profileData?.longitude 
                    ? [profileData.latitude, profileData.longitude] 
                    : [33.9716, -6.8498]}
                  zoom={profileData?.latitude && profileData?.longitude ? 14 : 6}
                />
              </MapContainer>
            </div>
          )}

          <Button type="submit" variant="hero" className="mt-6 text-white font-bold" disabled={profileLoading}>
            {profileLoading ? dashboardT.saving : dashboardT.saveBtn}
          </Button>
        </form>
      </div>

      {/* Security section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          {dashboardT.accountSecurity}
        </h3>
        
        {passError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 font-bold">
            {passError}
          </div>
        )}
        {passSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-lg mb-4 font-bold">
            {passSuccess}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-bold text-slate-700">{dashboardT.currentPassword}</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-bold text-slate-700">{dashboardT.newPassword}</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-bold text-slate-700">{dashboardT.confirmNewPassword}</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl border-slate-200"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="hero" 
            className="mt-2 w-full sm:w-auto px-8 text-white font-bold"
            disabled={passLoading}
          >
            {passLoading ? dashboardT.updatingPassword : dashboardT.updatePasswordBtn}
          </Button>
        </form>
      </div>
    </div>
  );
}
