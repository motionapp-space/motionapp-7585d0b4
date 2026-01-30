import { formatTimeRange } from "@/features/events/utils/calendar-utils";
import { getClientColorIndex } from "@/utils/clientColor";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { BookingRequestWithClient } from "../types";

interface BookingRequestCardProps {
  request: BookingRequestWithClient;
  onClick: () => void;
  positioning?: {
    top: number;
    height: number;
    leftPercent: number;
    widthPercent: number;
  };
}

export function BookingRequestCard({
  request,
  onClick,
  positioning,
}: BookingRequestCardProps) {
  // Single source of truth for color index with defensive fallback
  const colorIndex = request.coach_client_id 
    ? getClientColorIndex(request.coach_client_id) 
    : 1;

  const baseClasses = cn(
    "rounded-md p-2 cursor-pointer transition-all",
    "bg-muted/60 text-foreground border-l-4 border-dashed",
    // Scale only in list view, not in dense calendar
    !positioning && "hover:bg-muted hover:scale-[1.02]",
    positioning && "hover:bg-muted"
  );

  const style: React.CSSProperties = positioning
    ? {
        position: "absolute",
        top: positioning.top,
        height: Math.max(24, positioning.height),
        left: `${positioning.leftPercent * 100}%`,
        width: `${positioning.widthPercent * 100}%`,
        borderLeftColor: `hsl(var(--client-${colorIndex}))`,
      }
    : {
        borderLeftColor: `hsl(var(--client-${colorIndex}))`,
      };

  return (
    <div
      onClick={onClick}
      style={style}
      className={baseClasses}
      role="button"
      aria-label={`Pending booking request: ${request.client_name}`}
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold truncate text-xs">In attesa</span>
      </div>
      <div className="text-[11px] text-muted-foreground truncate">{request.client_name}</div>
      {!positioning && (
        <div className="text-[11px] text-muted-foreground mt-1">
          {formatTimeRange(
            request.requested_start_at,
            request.requested_end_at,
            false
          )}
        </div>
      )}
    </div>
  );
}
