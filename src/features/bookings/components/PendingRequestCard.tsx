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
      <CardContent className="p-0">
        {/* Header - Solo badge, bg-muted/30 (meno "alert-like") */}
        <div className="bg-muted/30 px-4 py-2.5 border-b">
          <Badge className="bg-primary hover:bg-primary text-primary-foreground font-medium">
            Da approvare
          </Badge>
        </div>

        {/* Corpo - Gerarchia corretta: Data/Ora > Cliente > Tipo sessione */}
        <div className="p-5 space-y-3">
          {/* 1. PRIMARIO: Data e ora */}
          <p className="text-lg font-semibold text-foreground">
            {formattedDateCompact} · {formattedTimeRange}
          </p>

          {/* 2. SECONDARIO: Nome cliente */}
          <div className="flex items-center gap-2">
            <ClientColorDot clientId={request.coach_client_id} />
            <span className="text-base font-medium text-foreground">
              {request.client_name}
            </span>
          </div>

          {/* 3. TERZIARIO: Tipo sessione */}
          <p className="text-sm text-muted-foreground">
            Lezione singola · {durationMinutes} min
          </p>

          {/* 4. Note opzionali */}
          {request.notes && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-md">
              "{request.notes}"
            </div>
          )}
        </div>

        {/* Separatore + Azioni */}
        <div className="border-t bg-muted/30 p-4 space-y-3">
          {/* Bottoni principali affiancati */}
          <div className="flex gap-3">
            <Button
              onClick={() => onApprove(request.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Approva
            </Button>
            <Button
              variant="outline"
              onClick={() => onCounterPropose(request)}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1.5" />
              Controproponi
            </Button>
          </div>

          {/* Link distruttivo CON conferma Popover */}
          <Popover open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
            <PopoverTrigger asChild>
              <button
                disabled={isLoading}
                className="w-full text-center text-sm text-destructive hover:underline disabled:opacity-50"
              >
                Rifiuta richiesta
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="center">
              <p className="text-sm text-foreground mb-3">
                Vuoi rifiutare la richiesta?
              </p>
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
