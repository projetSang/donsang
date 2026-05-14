import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export function usePatientData(userData: any, authLoading: boolean, logout: () => void) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const fetchDocuments = async (patientId: number) => {
    try {
      const data = await apiFetch(`/patients/${patientId}/documents`);
      setDocuments(data);
    } catch (e) {
      console.error("Error fetching documents", e);
    }
  };

  const fetchNotifications = async (patientId: number) => {
    try {
      const data = await apiFetch(`/patients/${patientId}/notifications`);
      setNotifications(data);
    } catch (e: any) {
      if (e.message?.includes("404")) {
        logout();
      }
      console.error("Error fetching notifications", e);
    }
  };

  useEffect(() => {
    if (!authLoading && userData) {
      fetchDocuments(userData.id);
      fetchNotifications(userData.id);
      if (userData.share_token) {
        setShareLink(`${window.location.origin}/dossier/partage/${userData.share_token}`);
      }
    }
  }, [userData, authLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userData) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("category", "Autre");

    setUploadingDoc(true);
    try {
      const newDoc = await apiFetch(`/patients/${userData.id}/documents`, {
        method: "POST",
        body: formData,
      });
      setDocuments(prev => [newDoc, ...prev]);
      toast.success("Document ajouté avec succès");
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingDoc(false);
    }
  };

  const generateShareToken = async () => {
    try {
      const data = await apiFetch("/generate-share-token", {
        method: "POST",
        body: JSON.stringify({ email: userData.email })
      });
      const link = `${window.location.origin}/dossier/partage/${data.share_token}`;
      setShareLink(link);
      toast.success("Lien de partage généré");
      return data.share_token;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération du lien");
      return null;
    }
  };

  const disableShareToken = async () => {
    try {
      await apiFetch("/disable-share-token", {
        method: "POST",
        body: JSON.stringify({ email: userData.email })
      });
      setShareLink("");
      toast.info("Lien de partage désactivé");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la désactivation");
      return false;
    }
  };

  const respondToAlert = async (type: "disponible" | "indisponible", title: string, alertId?: number) => {
    if (!userData || !alertId) return;

    try {
      await apiFetch("/alerts/respond", {
        method: "POST",
        body: JSON.stringify({
          alert_id: alertId,
          patient_id: userData.id,
          status: type === "disponible" ? "available" : "unavailable"
        })
      });

      if (type === "disponible") {
        toast.success("Merci ! Votre disponibilité a été enregistrée.", {
          description: `Réponse pour: ${title}`,
        });
      } else {
        toast.info("C'est noté. Merci.", {
          description: `Réponse pour: ${title}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return {
    documents,
    notifications,
    uploadingDoc,
    shareLink,
    handleFileUpload,
    generateShareToken,
    disableShareToken,
    respondToAlert
  };
}
