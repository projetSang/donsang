import { FileText, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicalTabProps {
  userData: any;
  documents: any[];
  uploadingDoc: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MedicalTab({
  userData,
  documents,
  uploadingDoc,
  handleFileUpload
}: MedicalTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold">Dossier médical</h2>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Maladies chroniques</label>
          <textarea
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
            value={(() => {
              if (!userData?.chronic_diseases) return "Aucune";
              if (Array.isArray(userData.chronic_diseases)) {
                return userData.chronic_diseases.length > 0 ? userData.chronic_diseases.join(", ") : "Aucune";
              }
              try {
                const parsed = JSON.parse(userData.chronic_diseases);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(", ") : "Aucune";
              } catch(e) {
                return userData.chronic_diseases || "Aucune";
              }
            })()}
            readOnly
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Allergies</label>
          <textarea
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
            value={userData?.allergies || "Aucune"}
            readOnly
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Traitements en cours</label>
          <textarea
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
            value={userData?.current_treatments || "Aucun"}
            readOnly
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Antécédents médicaux</label>
          <textarea
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-15"
            value={userData?.medical_history || "Aucun"}
            readOnly
          />
        </div>
      </div>
      
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Documents médicaux</h2>
          <div>
            <input 
              type="file" 
              id="document-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploadingDoc}
            />
            <label htmlFor="document-upload">
              <Button variant="hero" size="sm" asChild disabled={uploadingDoc}>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingDoc ? "Chargement..." : "Ajouter un document"}
                </span>
              </Button>
            </label>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border divide-y divide-border shadow-sm overflow-hidden">
          {documents.length > 0 ? documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">{doc.category} • {doc.date}</div>
                </div>
              </div>
              <a href={doc.file_url} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          )) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucun document médical disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
