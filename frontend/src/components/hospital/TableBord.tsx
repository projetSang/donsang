import { useState, useEffect } from "react";
import { 
  Heart, Search, Users, Droplets, Bell, BarChart3, LayoutDashboard,
} from "lucide-react";
import ReactApexChart from "react-apexcharts";

import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";

export default function TableBord() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  useEffect(() => {
    if (user?.id) {
      fetch(apiUrl(`/hospital/stats?hospital_id=${user.id}`))
        .then(res => res.json())
        .then(data => setStatsData(data))
        .catch(err => console.error("Erreur de récupération des statistiques backend", err));
    }
  }, [user]);
 
  const dynamicStats = [
    { label: "Donneurs dans la région", value: statsData?.donors_region || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Contacts établis", value: statsData?.established_contacts || "0", icon: Heart, color: "text-primary", bg: "bg-primary/5" },
    { label: "Demandes ce mois", value: statsData?.requests_month || "0", icon: Search, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Alertes en cours", value: statsData?.alerts || "0", icon: Droplets, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
     

          {/* Main Area */}
          <main className="flex-1 min-w-0 space-y-8">
            <div className="animate-reveal">
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Tableau de Bord
              </h1>
              <p className="text-slate-500 mt-1">Bienvenue, Voici l'état actuel de votre hôpital .</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dynamicStats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${s.bg} ${s.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</div>
                  <div className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wide text-[10px] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ApexCharts Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Évolution des Dons et Demandes</h2>
              <ReactApexChart 
                options={{
                  chart: { type: 'area', height: 350, toolbar: { show: false } },
                  colors: ['#ef4444', '#3b82f6'],
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth', width: 2 },
                  xaxis: { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'] },
               
                }} 
                series={[
                  { 
                    name: 'Dons de Sang', 
                    data: statsData?.chart_data?.donations || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
                  },
                  { 
                    name: 'Demandes', 
                    data: statsData?.chart_data?.requests || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
                  }
                ]} 
                type="area" 
                height={350} 
              />
            </div>
           
          </main>
        </div>
      
  );
}
