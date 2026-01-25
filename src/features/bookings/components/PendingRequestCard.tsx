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

  const formattedDateCompact = format(startDate, "EEE d MMM", { locale: it });
  const formattedTimeRange = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

  const isLoading = isApproving || isDeclining;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* BLOCCO INFO */}
        <div className="space-y-1">
          {/* Riga 1: Badge + Data · Orario (sempre su una riga) */}
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 whitespace-nowrap pointer-events-none">
              Da approvare
            </Badge>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formattedDateCompact} ·
            </span>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {formattedTimeRange}
            </span>
          </div>

          {/* Riga 2: Cliente */}
          <div className="flex items-center gap-1.5 min-w-0">
            <ClientColorDot clientId={request.coach_client_id} />
            <span className="text-sm font-medium text-foreground truncate">
              {request.client_name}
            </span>
          </div>

          {/* Riga 3: Meta */}
          <p className="text-xs text-muted-foreground">
            Lezione singola · {durationMinutes} min
          </p>

          {/* Note opzionali */}
          {request.notes && (
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              "{request.notes}"
            </p>
          )}
        </div>

        {/* BLOCCO AZIONI - Responsive stabile */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:flex-nowrap">
          <Button
            size="sm"
            className="h-9 w-full sm:w-auto"
            onClick={() => onApprove(request.id)}
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-1" />
            Approva
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full sm:w-auto"
            onClick={() => onCounterPropose(request)}
            disabled={isLoading}
          >
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            Controproponi
          </Button>

          <Popover open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading}
              >
                Rifiuta
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <p className="text-sm text-foreground mb-2">Rifiutare la richiesta?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmDeclineOpen(false)}
                >
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onDecline(request.id);
                    setConfirmDeclineOpen(false);
                  }}
                >
                  Rifiuta
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
