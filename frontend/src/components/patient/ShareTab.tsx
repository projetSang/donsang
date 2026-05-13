import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Générez un lien sécurisé pour permettre à votre médecin de consulter votre dossier en lecture seule.
          </p>
          <div className="flex gap-2">
            <Input 
              value={shareLink || "Aucun lien actif"} 
              readOnly 
              className="flex-1 font-mono text-xs bg-muted/30" 
            />
            {shareLink && (
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => navigator.clipboard.writeText(shareLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="sm" className="rounded-xl" onClick={handleGenerateShareToken}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {shareLink ? "Régénérer le lien" : "Générer un lien"}
            </Button>
            {shareLink && (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl" onClick={handleDisableShareToken}>
                Désactiver le lien
              </Button>
            )}
          </div>
          {shareLink && (
            <div className="bg-muted/50 rounded-xl p-4 text-sm border border-border/50">
              <div className="font-bold text-slate-900 mb-2">Paramètres du lien</div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Durée de validité : 30 jours
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Accès : Lecture seule
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Statut : Actif
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
