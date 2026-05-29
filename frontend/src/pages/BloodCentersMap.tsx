import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Locate, Search, Loader2, Navigation, Heart, Phone, Clock, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface BloodCenter {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "hospital" | "clinic" | "blood_bank" | "donation_center";
  address?: string;
  phone?: string;
  opening_hours?: string;
  distance?: number;
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;
    background:radial-gradient(circle, #3b82f6 0%, #1d4ed8 60%);
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse-blue 2s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const centerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:34px;height:34px;
    background:linear-gradient(135deg,#ef4444,#b91c1c);
    border:3px solid white;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 15px rgba(239,68,68,0.4);
    font-size:16px;
  ">🩸</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const hospitalIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:34px;height:34px;
    background:linear-gradient(135deg,#dc2626,#991b1b);
    border:3px solid white;
    border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 15px rgba(220,38,38,0.4);
    font-size:16px;
  ">🏥</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchBloodCenters(lat: number, lon: number, radius: number): Promise<BloodCenter[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="blood_bank"](around:${radius},${lat},${lon});
      node["healthcare"="blood_bank"](around:${radius},${lat},${lon});
      node["healthcare"="blood_donation"](around:${radius},${lat},${lon});
      node["healthcare:speciality"="blood_bank"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});
    );
    out center tags;
  `;

  const endpoints = [
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  let response = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (res.ok) {
        response = res;
        break;
      }
    } catch (e) {
      console.warn(`Failed to fetch from ${endpoint}`, e);
    }
  }

  if (!response) throw new Error("Overpass API error on all endpoints");

  const data = await response.json();

  const centers: BloodCenter[] = data.elements
    .filter((el: any) => {
      const tags = el.tags || {};
      const name = tags.name || "";
      // Filter out duplicates and unnamed
      return name.length > 0;
    })
    .map((el: any) => {
      const tags = el.tags || {};
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;

      const amenity = tags.amenity || tags.healthcare || "";
      let type: BloodCenter["type"] = "clinic";
      if (amenity === "hospital") type = "hospital";
      else if (amenity === "blood_bank" || amenity === "blood_donation") type = "blood_bank";
      else if (amenity === "donation_center") type = "donation_center";

      const dist = getDistance(lat, lon, elLat, elLon);

      return {
        id: `${el.type}-${el.id}`,
        name: tags.name || "Centre médical",
        lat: elLat,
        lon: elLon,
        type,
        address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
          .filter(Boolean)
          .join(", ") || tags["addr:full"] || undefined,
        phone: tags.phone || tags["contact:phone"] || undefined,
        opening_hours: tags.opening_hours || undefined,
        distance: dist,
      } as BloodCenter;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    .slice(0, 30);

  return centers;
}

export default function BloodCentersMap() {
  const { t, isRtl } = useLanguage();
  const pageT = t.bloodCentersPage;

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [centers, setCenters] = useState<BloodCenter[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BloodCenter | null>(null);
  const [radius, setRadius] = useState(10000); // 10km default
  const [citySearch, setCitySearch] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.9716, -6.8498], // Morocco center
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when centers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    centers.forEach((center) => {
      const icon = center.type === "hospital" ? hospitalIcon : centerIcon;
      const marker = L.marker([center.lat, center.lon], { icon })
        .addTo(mapRef.current!)
        .on("click", () => setSelected(center));

      markersRef.current.push(marker);
    });
  }, [centers]);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup(`<b>📍 ${pageT.yourPosition}</b>`)
      .openPopup();
  }, [userLocation, mapReady, pageT.yourPosition]);

  const loadCenters = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchBloodCenters(lat, lon, radius);
      setCenters(results);
      if (results.length === 0) {
        setError(pageT.errorNoCenter);
      }
    } catch (e) {
      setError(pageT.errorLoadCenter);
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError(pageT.errorGeoSupport);
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        mapRef.current?.setView([latitude, longitude], 13);
        loadCenters(latitude, longitude);
        setGeoLoading(false);
      },
      (err) => {
        setError(pageT.errorGeoPermission);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCitySearch = async () => {
    if (!citySearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch + ", Maroc")}&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) {
        setError(pageT.errorCityNotFound);
        setLoading(false);
        return;
      }
      const { lat, lon } = data[0];
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      setUserLocation({ lat: latNum, lon: lonNum });
      mapRef.current?.setView([latNum, lonNum], 13);
      await loadCenters(latNum, lonNum);
    } catch {
      setError(pageT.errorSearch);
      setLoading(false);
    }
  };

  const typeLabel = (type: BloodCenter["type"]) => {
    const labels: Record<BloodCenter["type"], string> = {
      hospital: pageT.typeHospital,
      clinic: pageT.typeClinic,
      blood_bank: pageT.typeBloodBank,
      donation_center: pageT.typeDonationCenter,
    };
    return labels[type];
  };

  const typeColor = (type: BloodCenter["type"]) => {
    const colors: Record<BloodCenter["type"], string> = {
      hospital: "bg-red-100 text-red-700",
      clinic: "bg-orange-100 text-orange-700",
      blood_bank: "bg-rose-100 text-rose-700",
      donation_center: "bg-pink-100 text-pink-700",
    };
    return colors[type];
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 pt-16 animate-reveal">
        {/* Header */}
        <div className="bg-white border-b border-red-100 shadow-sm">
          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">{pageT.title}</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {pageT.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col sm:flex-row gap-3 md:justify-end">
                {/* City search */}
                <div className="flex gap-2 flex-1 max-w-sm">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                    placeholder={pageT.searchPlaceholder}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-slate-50"
                  />
                  <button
                    onClick={handleCitySearch}
                    disabled={loading}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-200"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* Radius selector */}
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                >
                  <option value={5000}>{pageT.radius5}</option>
                  <option value={10000}>{pageT.radius10}</option>
                  <option value={20000}>{pageT.radius20}</option>
                  <option value={50000}>{pageT.radius50}</option>
                </select>

                {/* Geolocate button */}
                <button
                  onClick={handleGeolocate}
                  disabled={geoLoading || loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4" />
                  )}
                  {pageT.myLocation}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)]">
          {/* Sidebar - centers list */}
          <div className="w-full lg:w-80 xl:w-96 bg-white border-r border-slate-100 overflow-y-auto shrink-0 order-2 lg:order-1 max-h-64 lg:max-h-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                <p className="text-sm text-slate-500 font-medium">
                  {pageT.searchingCenters}
                </p>
              </div>
            ) : centers.length > 0 ? (
              <div>
                <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {pageT.centersFound
                      .replace("{count}", centers.length.toString())
                      .replace(/{plural}/g, centers.length > 1 ? (isRtl ? "" : "s") : "")}
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  {centers.map((center) => (
                    <button
                      key={center.id}
                      onClick={() => {
                        setSelected(center);
                        mapRef.current?.setView([center.lat, center.lon], 16);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-red-50/60 transition-colors ${
                        selected?.id === center.id ? "bg-red-50 border-l-3 border-l-red-500" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-0.5 shrink-0">
                          {center.type === "hospital" ? "🏥" : "🩸"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{center.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor(center.type)}`}>
                              {typeLabel(center.type)}
                            </span>
                            {center.distance !== undefined && (
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {center.distance < 1
                                  ? `${Math.round(center.distance * 1000)}${isRtl ? " متر" : "m"}`
                                  : `${center.distance.toFixed(1)}${isRtl ? " كم" : "km"}`}
                              </span>
                            )}
                          </div>
                          {center.address && (
                            <p className="text-[11px] text-slate-500 mt-1 truncate">{center.address}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center gap-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Heart className="h-8 w-8 text-red-300 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600">
                    {pageT.noCentersDisplayed}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {pageT.noCentersDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative order-1 lg:order-2 h-72 lg:h-auto">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Selected center popup */}
            {selected && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-sm">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-scale-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl mt-0.5">
                        {selected.type === "hospital" ? "🏥" : "🩸"}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-base leading-tight">
                          {selected.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor(selected.type)}`}>
                          {typeLabel(selected.type)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {selected.distance !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="font-semibold">
                          {selected.distance < 1
                            ? `${Math.round(selected.distance * 1000)} ${pageT.meters}`
                            : `${selected.distance.toFixed(1)} km`} {pageT.fromYou}
                        </span>
                      </div>
                    )}
                    {selected.address && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{selected.address}</span>
                      </div>
                    )}
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-green-500 shrink-0" />
                        <a href={`tel:${selected.phone}`} className="text-green-600 hover:underline font-medium">
                          {selected.phone}
                        </a>
                      </div>
                    )}
                    {selected.opening_hours && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-xs">{selected.opening_hours}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-red-200"
                  >
                    <Navigation className="h-4 w-4" />
                    {pageT.getRoute}
                  </a>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{pageT.legend}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span>🏥</span> <span>{pageT.typeHospital}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span>🩸</span> <span>{pageT.typeClinic}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                  <span>{pageT.yourPosition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.3); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0), 0 2px 8px rgba(0,0,0,0.3); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0), 0 2px 8px rgba(0,0,0,0.3); }
        }
      `}</style>
    </>
  );
}
