import { useState, useMemo } from "react";
import { format, startOfDay, addDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, ChevronDown, ChevronUp, Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useBookingSettingsQuery } from "../hooks/useBookingSettingsQuery";
import { useAvailabilityWindowsQuery } from "../hooks/useAvailabilityWindowsQuery";
import { useOutOfOfficeBlocksQuery } from "../hooks/useOutOfOfficeBlocksQuery";
import { useEventsQuery } from "@/features/events/hooks/useEventsQuery";
import { generateAvailableSlots, findNearestSlots } from "../utils/slot-generator";
import type { BookingRequestWithClient, AvailableSlot } from "../types";

interface CounterProposeDialogProps {
  request: BookingRequestWithClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, startAt: string, endAt: string) => void;
  isSubmitting?: boolean;
}

export function CounterProposeDialog({
  request,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CounterProposeDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    request ? new Date(request.requested_start_at) : undefined
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showAllSlots, setShowAllSlots] = useState(false);

  // Fetch settings and availability data
  const { data: settings } = useBookingSettingsQuery();
  const { data: windows = [] } = useAvailabilityWindowsQuery();
  const { data: oooBlocks = [] } = useOutOfOfficeBlocksQuery();
  
  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, settings?.max_future_days || 30);
  const { data: events = [] } = useEventsQuery({
    start_date: format(rangeStart, 'yyyy-MM-dd'),
    end_date: format(rangeEnd, 'yyyy-MM-dd'),
  });

  const slotDuration = settings?.slot_duration_minutes || 60;
  const minAdvanceNotice = settings?.min_advance_notice_hours || 2;
  const bufferBetween = settings?.buffer_between_minutes || 0;

  // Original request details
  const originalStart = request ? new Date(request.requested_start_at) : null;
  const originalEnd = request ? new Date(request.requested_end_at) : null;

  // Generate available slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !settings) return [];
    
    return generateAvailableSlots({
      date: selectedDate,
      slotDurationMinutes: slotDuration,
      bufferBetweenMinutes: bufferBetween,
      minAdvanceNoticeHours: minAdvanceNotice,
      availabilityWindows: windows,
      outOfOfficeBlocks: oooBlocks.map(b => ({ start_at: b.start_at, end_at: b.end_at })),
      existingEvents: events.map(e => ({ start_at: e.start_at, end_at: e.end_at })),
    });
  }, [selectedDate, windows, oooBlocks, events, slotDuration, bufferBetween, minAdvanceNotice, settings]);

  // Get all available slots for the next 14 days to find suggestions
  const allSlotsFor14Days = useMemo(() => {
    if (!settings) return [];
    
    const allSlots: AvailableSlot[] = [];
    const today = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const daySlots = generateAvailableSlots({
        date,
        slotDurationMinutes: slotDuration,
        bufferBetweenMinutes: bufferBetween,
        minAdvanceNoticeHours: minAdvanceNotice,
        availabilityWindows: windows,
        outOfOfficeBlocks: oooBlocks.map(b => ({ start_at: b.start_at, end_at: b.end_at })),
        existingEvents: events.map(e => ({ start_at: e.start_at, end_at: e.end_at })),
      });
      allSlots.push(...daySlots);
    }
    
    return allSlots;
  }, [windows, oooBlocks, events, slotDuration, bufferBetween, minAdvanceNotice, settings]);

  // Get suggested slots (nearest to original request)
  const suggestedSlots = useMemo(() => {
    if (!originalStart || allSlotsFor14Days.length === 0) return [];
    
    // Find nearest slots, excluding the original request time
    return findNearestSlots(
      originalStart,
      allSlotsFor14Days,
      request?.requested_start_at
    ).slice(0, 4);
  }, [originalStart, allSlotsFor14Days, request?.requested_start_at]);

  // Slots to show based on whether we're showing all or just for selected date
  const displaySlots = useMemo(() => {
    if (showAllSlots) {
      return availableSlots;
    }
    return availableSlots.slice(0, 6);
  }, [availableSlots, showAllSlots]);

  const hasMoreSlots = availableSlots.length > 6;

  // Check if a date has available slots
  const dateHasSlots = (date: Date) => {
    const slots = generateAvailableSlots({
      date,
      slotDurationMinutes: slotDuration,
      bufferBetweenMinutes: bufferBetween,
      minAdvanceNoticeHours: minAdvanceNotice,
      availabilityWindows: windows,
      outOfOfficeBlocks: oooBlocks.map(b => ({ start_at: b.start_at, end_at: b.end_at })),
      existingEvents: events.map(e => ({ start_at: e.start_at, end_at: e.end_at })),
    });
    return slots.length > 0;
  };

  const handleSubmit = () => {
    if (!selectedSlot || !request) return;
    onSubmit(request.id, selectedSlot.start, selectedSlot.end);
  };

  const isSlotSelected = (slot: AvailableSlot) => {
    return selectedSlot && 
      slot.start === selectedSlot.start &&
      slot.end === selectedSlot.end;
  };

  const formatSlotTime = (slot: AvailableSlot) => {
    const start = parseISO(slot.start);
    const end = parseISO(slot.end);
    return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
  };

  const formatSlotDate = (slot: AvailableSlot) => {
    return format(parseISO(slot.start), "EEE d MMM", { locale: it });
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 grid grid-rows-[auto_1fr_auto] overflow-hidden">
        {/* Header - Subtitle guida + chip richiesta originale */}
        <div className="bg-muted/50 border-b px-4 py-3">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold">
              Proponi un nuovo orario
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Il cliente potrà accettare o rifiutare la tua proposta.
            </p>
            {originalStart && originalEnd && (
              <div className="pt-1">
                <Badge variant="outline" className="font-normal text-sm py-1 px-3">
                  Richiesta: {format(originalStart, "EEE d MMM", { locale: it })} · {format(originalStart, "HH:mm")}–{format(originalEnd, "HH:mm")}
                </Badge>
              </div>
            )}
          </DialogHeader>
        </div>

        <div className="min-h-0 overflow-y-auto">
          {/* Suggested Slots Section */}
          {suggestedSlots.length > 0 && (
            <div className="px-4 py-3 border-b bg-primary/5">
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Orari suggeriti
                </div>
                <p className="text-xs text-muted-foreground">
                  Suggeriti in base alla tua disponibilità. Puoi anche scegliere un giorno e orario diverso.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSelectedDate(parseISO(slot.start));
                    }}
                    className={cn(
                      "flex flex-col items-start p-2 rounded-lg border text-left transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      isSlotSelected(slot)
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatSlotDate(slot)}
                    </span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {formatSlotTime(slot)}
                      {isSlotSelected(slot) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Section */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-foreground mb-3">
              Scegli un giorno alternativo
            </p>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
                setShowAllSlots(false);
              }}
              disabled={(date) => 
                date < startOfDay(new Date()) || 
                date > rangeEnd ||
                !dateHasSlots(date)
              }
              modifiers={{
                original: originalStart ? [originalStart] : [],
              }}
              modifiersClassNames={{
                original: "ring-2 ring-primary/30 ring-offset-1",
              }}
              className="rounded-md border mx-auto pointer-events-auto"
              locale={it}
            />
          </div>

          {/* Placeholder quando nessun giorno selezionato */}
          {!selectedDate && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Seleziona un giorno per vedere gli orari disponibili
              </p>
            </div>
          )}

          {/* Time Slots Section - solo se data selezionata */}
          {selectedDate && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Orari disponibili</span>
              </div>
              
              <div className="space-y-3">
                  {displaySlots.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {displaySlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "p-2 rounded-lg border text-sm font-medium transition-all",
                              "hover:border-primary hover:bg-primary/5",
                              isSlotSelected(slot)
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border bg-background"
                            )}
                          >
                            <span className="flex items-center justify-center gap-1">
                              {format(parseISO(slot.start), "HH:mm")}
                              {isSlotSelected(slot) && (
                                <Check className="h-3 w-3 text-primary" />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>

                      {hasMoreSlots && (
                        <Collapsible open={showAllSlots} onOpenChange={setShowAllSlots}>
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-muted-foreground"
                            >
                              {showAllSlots ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Mostra meno
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Altri {availableSlots.length - 6} orari
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {availableSlots.slice(6).map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm font-medium transition-all",
                                    "hover:border-primary hover:bg-primary/5",
                                    isSlotSelected(slot)
                                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                                      : "border-border bg-background"
                                  )}
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    {format(parseISO(slot.start), "HH:mm")}
                                    {isSlotSelected(slot) && (
                                      <Check className="h-3 w-3 text-primary" />
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nessuno slot disponibile per questa data
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Dynamic CTA con feedback selezione parziale */}
        <div className="border-t bg-background p-4">
          {selectedSlot ? (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Nuova proposta: <span className="font-medium text-foreground">
                  {formatSlotDate(selectedSlot)} · {formatSlotTime(selectedSlot)}
                </span>
              </p>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                Invia controproposta
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Riepilogo selezione parziale */}
              {selectedDate && !selectedSlot && (
                <p className="text-center text-sm text-muted-foreground">
                  Giorno selezionato: {format(selectedDate, "d MMM", { locale: it })} · scegli un orario
                </p>
              )}
              
              <Button disabled className="w-full" size="lg">
                Invia controproposta
              </Button>
              
              {!selectedDate && (
                <p className="text-center text-sm text-muted-foreground">
                  Seleziona un giorno e un orario per continuare
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
