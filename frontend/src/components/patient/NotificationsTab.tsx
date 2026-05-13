import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsTabProps {
  notifications: any[];
  handleAvailabilityResponse: (type: "disponible" | "indisponible", title: string, alertId?: number) => void;
}

export function NotificationsTab({
  notifications,
  handleAvailabilityResponse
}: NotificationsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold">Notifications</h2>
      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((n, i) => (
          <div key={n.id || i} className={`bg-card rounded-xl border p-4 flex items-start gap-3 ${n.urgent ? "border-primary shadow-sm" : "border-border"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.urgent ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
            </div>
            {n.urgent && (
              <div className="flex gap-2">
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => handleAvailabilityResponse("disponible", n.title, n.alert_id)}
                >
                  Disponible
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAvailabilityResponse("indisponible", n.title, n.alert_id)}
                >
                  Indisponible
                </Button>
              </div>
            )}
          </div>
        )) : (
          <div className="p-8 text-center text-muted-foreground text-sm border border-border rounded-xl">
            Aucune notification pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
