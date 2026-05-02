import { BarChart3, Search } from "lucide-react";
import { useState, useEffect } from "react";

export function StatsTab() {
  const [statistiques, setStatistiques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/hospital/statistiques")
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
      
<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : statistiques.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statistiques.map((item) => (
            <div key={item.group} className="text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
              <div className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{item.group}</div>
              <div className="text-2xl font-bold mt-2 text-slate-900">{item.count}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{item.pct}% du total</div>
              <div className="mt-4 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full hero-gradient rounded-full" style={{ width: `${item.pct}%` }} />
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
