import { formatTimeRange } from "../utils/calendar-utils";
import { getClientColorIndex } from "@/utils/clientColor";
import { cn } from "@/lib/utils";
import type { EventWithClient } from "../types";

interface EventCardProps {
  event: EventWithClient;
  onClick: () => void;
  compact?: boolean;
  // Positioning for continuous layout (optional)
  positioning?: {
    top: number;
    height: number;
    leftPercent: number;
    widthPercent: number;
  };
}

export function EventCard({ event, onClick, compact = false, positioning }: EventCardProps) {
  // Single source of truth for color index
  const colorIndex = event.coach_client_id 
    ? getClientColorIndex(event.coach_client_id) 
    : 1;

  const baseClasses = cn(
    "rounded-md p-2 cursor-pointer transition-all shadow-sm",
    "bg-muted text-foreground border-l-4",
    // Scale only in list view, not in dense calendar
    !positioning && "hover:shadow-md hover:scale-[1.02]",
    positioning && "hover:shadow-md",
    compact && "text-xs py-1 px-2"
  );

  const style: React.CSSProperties = positioning ? {
    position: 'absolute',
    top: positioning.top,
    height: Math.max(24, positioning.height),
    left: `${positioning.leftPercent * 100}%`,
    width: `${positioning.widthPercent * 100}%`,
    borderLeftColor: `hsl(var(--client-${colorIndex}))`,
  } : {
    borderLeftColor: `hsl(var(--client-${colorIndex}))`,
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={baseClasses}
      role="button"
      aria-label={`${event.title}${event.client_name ? ` with ${event.client_name}` : ''}`}
    >
      <div className="font-semibold truncate text-xs">{event.title}</div>
      <div className="text-[11px] text-muted-foreground truncate">{event.client_name}</div>
      {!compact && !positioning && (
        <div className="text-[11px] text-muted-foreground mt-1">
          {formatTimeRange(event.start_at, event.end_at, event.is_all_day)}
        </div>
      )}
    </div>
  );
}
