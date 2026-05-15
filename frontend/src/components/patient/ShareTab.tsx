import { Copy, RefreshCw, Share2, Calendar, ShieldCheck, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareTabProps {
  shareLink: string;
  handleGenerateShareToken: () => void;
  handleDisableShareToken: () => void;
}

export function ShareTab({
  shareLink,
  handleGenerateShareToken,
  handleDisableShareToken
}: ShareTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Partager mon dossier</h2>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          
          <div className="relative z-10">
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
              Générez un lien sécurisé et temporaire pour permettre à vos médecins de consulter votre historique médical en lecture seule.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1 group/input">
                <Input 
                  value={shareLink || "Aucun lien actif"} 
                  readOnly 
                  className="h-14 pl-5 pr-12 font-mono text-xs bg-slate-50 border-slate-100 rounded-2xl focus-visible:ring-primary/20 transition-all" 
                />
                {shareLink && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Lien copié dans le presse-papier !");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    title="Copier le lien"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="hero" 
                  className="h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                  onClick={handleGenerateShareToken}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {shareLink ? "Régénérer" : "Générer le lien"}
                </Button>
                
                {shareLink && (
                  <Button 
                    variant="outline" 
                    className="h-14 px-4 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600"
                    onClick={() => window.open(shareLink, '_blank')}
                    title="Prévisualiser"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {shareLink && (
              <div className="mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 h-10 font-bold text-[10px] uppercase tracking-widest" 
                  onClick={handleDisableShareToken}
                >
                  Révoquer l'accès immédiatement
                </Button>
              </div>
            )}
          </div>

          {shareLink && (
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-100/50">
              <div className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Propriétés de sécurité du lien
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Validité", value: "30 jours glissants", icon: Calendar, color: "text-blue-500" },
                  { label: "Autorisation", value: "Lecture seule", icon: ShieldCheck, color: "text-emerald-500" },
                  { label: "Visibilité", value: "Documents & Profil", icon: Activity, color: "text-amber-500" },
                  { label: "Statut", value: "Lien Actif", icon: Heart, color: "text-red-500" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-700">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
