import { BarChart3, Search } from "lucide-react";
import { useState, useEffect } from "react";

export function StatsTab() {
  const [statistiques, setStatistiques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backend-production-4a57.up.railway.app/api/hospital/statistiques")
      .then(res => res.json())
      .then(data => {
        setStatistiques(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("statistiques error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          Statistiques des Donneurs
        </h1>
        <p className="text-slate-500 mt-1">Répartition des donneurs par groupe sanguin dans votre base de données.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : statistiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {statistiques.map((item) => (
              <div key={item.group} className="text-center p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
                <div className="text-2xl sm:text-3xl font-black text-primary group-hover:scale-110 transition-transform">{item.group}</div>
                <div className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2 text-slate-900">{item.count}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{item.pct}% du total</div>
                <div className="mt-3 sm:mt-4 h-2.5 rounded-full overflow-hidden flex items-center">
                  <progress 
                    value={item.pct} 
                    max="100" 
                    className="w-full h-full appearance-none [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary rounded-full overflow-hidden" 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune statistique disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
