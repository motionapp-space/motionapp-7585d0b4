import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: "active" | "low" | "inactive" | undefined;
}

export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  if (!status) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const config = {
    active: {
      label: "Attivo",
      icon: Activity,
      variant: "success" as const,
    },
    low: {
      label: "Bassa",
      icon: Clock,
      variant: "warning" as const,
    },
    inactive: {
      label: "Assente",
      icon: AlertCircle,
      variant: "danger" as const,
    }
  };

  const { label, icon: Icon, variant } = config[status];

  return (
    <Badge variant={variant} className="font-medium gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
