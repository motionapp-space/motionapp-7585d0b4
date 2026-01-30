import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

interface PackageStatusBadgeProps {
  status: "active" | "low" | "expired" | "none" | undefined;
  sessionsUsed?: number | null;
  sessionsTotal?: number | null;
}

export function PackageStatusBadge({ status, sessionsUsed, sessionsTotal }: PackageStatusBadgeProps) {
  if (!status) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const config = {
    active: {
      label: "Attivo",
      icon: Package,
      variant: "success" as const,
    },
    low: {
      label: "In esaurimento",
      icon: AlertTriangle,
      variant: "warning" as const,
    },
    expired: {
      label: "Da rinnovare",
      icon: XCircle,
      variant: "danger" as const,
    },
    none: {
      label: "Nessuno",
      icon: MinusCircle,
      variant: "default" as const,
    }
  };

  const { label, icon: Icon, variant } = config[status];

  const badge = (
    <Badge variant={variant} className="font-medium gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );

  // Se abbiamo i dati delle sessioni, mostriamo il tooltip
  if (sessionsUsed != null && sessionsTotal != null && status !== 'none') {
    const remaining = sessionsTotal - sessionsUsed;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {remaining}/{sessionsTotal} sessioni rimanenti
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
