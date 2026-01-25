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
        <div className="flex items-start gap-4">
          
          {/* LEFT: Info (2 righe) */}
          <div className="flex-1 min-w-0 space-y-1.5">
            
            {/* Riga 1: Badge + Data/Ora */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground text-xs font-medium">
                Da approvare
              </Badge>
              <span className="text-sm font-semibold text-foreground">
                {formattedDateCompact} · {formattedTimeRange}
              </span>
            </div>
            
            {/* Riga 2: Cliente + Tipo sessione */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ClientColorDot clientId={request.coach_client_id} />
              <span className="font-medium text-foreground truncate">
                {request.client_name}
              </span>
              <span>·</span>
              <span className="truncate">
                Lezione singola · {durationMinutes} min
              </span>
            </div>
            
            {/* Note opzionali - compatte */}
            {request.notes && (
              <p className="text-xs text-muted-foreground italic truncate">
                "{request.notes}"
              </p>
            )}
          </div>
          
          {/* RIGHT: Azioni compatte */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onApprove(request.id)} disabled={isLoading}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Approva
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCounterPropose(request)} disabled={isLoading}>
                <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
                Controproponi
              </Button>
            </div>
            
            {/* Rifiuta con Popover conferma */}
            <Popover open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
              <PopoverTrigger asChild>
                <button disabled={isLoading} className="text-xs text-destructive hover:underline disabled:opacity-50">
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
