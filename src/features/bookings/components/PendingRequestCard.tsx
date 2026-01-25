import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Check, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientColorDot } from "@/components/calendar/ClientColorDot";
import type { BookingRequestWithClient } from "../types";

interface PendingRequestCardProps {
  request: BookingRequestWithClient;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onCounterPropose: (request: BookingRequestWithClient) => void;
  isApproving?: boolean;
  isDeclining?: boolean;
}

export function PendingRequestCard({
  request,
  onApprove,
  onDecline,
  onCounterPropose,
  isApproving,
  isDeclining,
}: PendingRequestCardProps) {
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false);
  
  const startDate = new Date(request.requested_start_at);
  const endDate = new Date(request.requested_end_at);
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  // Formato compatto senza capitalize
  const formattedDateCompact = format(startDate, "EEE d MMM", { locale: it });
  const formattedTimeRange = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

  const isLoading = isApproving || isDeclining;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* 3 colonne: Stato | Info | Azioni */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">

          {/* COL 1: Stato (fissa, piccola) */}
          <div className="pt-0.5">
            <Badge className="bg-primary hover:bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
              Da approvare
            </Badge>
          </div>

          {/* COL 2: Info (elastica) */}
          <div className="flex flex-col space-y-1.5 min-w-0">
            {/* Riga 1: Data/ora mai troncata */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {formattedDateCompact} · {formattedTimeRange}
              </span>
            </div>

            {/* Riga 2: Nome troncabile + meta troncabile */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <ClientColorDot clientId={request.coach_client_id} />
                <span className="font-medium text-foreground truncate">
                  {request.client_name}
                </span>
              </div>
              <span className="shrink-0">·</span>
              <span className="truncate">
                Lezione singola · {durationMinutes} min
              </span>
            </div>

            {/* Note opzionali */}
            {request.notes && (
              <p className="text-xs text-muted-foreground italic line-clamp-1">
                "{request.notes}"
              </p>
            )}
          </div>

          {/* COL 3: Azioni (fissa, allineata) */}
          <div className="flex flex-col items-end gap-1.5">
            <Button 
              className="h-9 px-3" 
              onClick={() => onApprove(request.id)} 
              disabled={isLoading}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Approva
            </Button>
            <Button 
              variant="outline" 
              className="h-9 px-3" 
              onClick={() => onCounterPropose(request)} 
              disabled={isLoading}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
              Controproponi
            </Button>

            {/* Rifiuta con Popover */}
            <Popover open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
              <PopoverTrigger asChild>
                <button 
                  disabled={isLoading} 
                  className="text-xs text-destructive hover:underline disabled:opacity-50 mt-1"
                >
                  Rifiuta
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <p className="text-sm text-foreground mb-2">Vuoi rifiutare?</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDeclineOpen(false)}>
                    Annulla
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => { onDecline(request.id); setConfirmDeclineOpen(false); }}>
                    Rifiuta
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
