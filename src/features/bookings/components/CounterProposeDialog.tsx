import { useState, useMemo, useEffect } from "react";
import { format, startOfDay, addDays, addMinutes, parseISO, setHours, setMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
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
  // Existing slot selection state
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Selection mode: fast (suggested) vs power (manual)
  const [selectionMode, setSelectionMode] = useState<'suggested' | 'manual' | null>(null);

  // Manual selection state (power path)
  const [manualDate, setManualDate] = useState<Date | undefined>(undefined);
  const [manualTime, setManualTime] = useState<string>(""); // "HH:mm"

  // Availability check live
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'loading' | 'available' | 'conflict'>('idle');
  const [conflictEvent, setConflictEvent] = useState<{ title: string; start: string; end: string } | null>(null);
  const [alternativeSlots, setAlternativeSlots] = useState<AvailableSlot[]>([]);

  // Debounce for availability check
  const debouncedManualDate = useDebounce(manualDate, 300);
  const debouncedManualTime = useDebounce(manualTime, 300);

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

  // Availability check live effect
  useEffect(() => {
    // Reset if we don't have both date and time
    if (!debouncedManualDate || !debouncedManualTime || !settings) {
      setAvailabilityStatus('idle');
      setConflictEvent(null);
      setAlternativeSlots([]);
      return;
    }

    setAvailabilityStatus('loading');
    
    // Build datetime from date + time
    const [hours, minutes] = debouncedManualTime.split(':').map(Number);
    const proposedStart = setMinutes(setHours(debouncedManualDate, hours), minutes);
    const proposedEnd = addMinutes(proposedStart, slotDuration);

    // Check conflicts with existing events
    const conflicting = events.find(event => {
      // Ignore canceled events
      if (event.session_status === 'canceled') return false;
      const eventStart = parseISO(event.start_at);
      const eventEnd = parseISO(event.end_at);
      // Overlap check: proposedStart < eventEnd AND proposedEnd > eventStart
      return (proposedStart < eventEnd && proposedEnd > eventStart);
    });

    if (conflicting) {
      setAvailabilityStatus('conflict');
      setConflictEvent({
        title: conflicting.title || 'Appuntamento',
        start: conflicting.start_at,
        end: conflicting.end_at
      });
      // Find 3 nearest alternatives
      const alternatives = findNearestSlots(proposedStart, allSlotsFor14Days).slice(0, 3);
      setAlternativeSlots(alternatives);
    } else {
      setAvailabilityStatus('available');
      setConflictEvent(null);
      setAlternativeSlots([]);
    }
  }, [debouncedManualDate, debouncedManualTime, events, settings, slotDuration, allSlotsFor14Days]);

  // Handlers for selection
  const handleSuggestedSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setSelectionMode('suggested');
    // Reset manual selection
    setManualDate(undefined);
    setManualTime("");
    setAvailabilityStatus('idle');
    setConflictEvent(null);
    setAlternativeSlots([]);
  };

  const handleManualDateChange = (date: Date | undefined) => {
    setManualDate(date);
    if (date) {
      setSelectionMode('manual');
      setSelectedSlot(null); // Deselect suggested
    }
  };

  const handleManualTimeChange = (time: string) => {
    setManualTime(time);
    if (manualDate && time) {
      setSelectionMode('manual');
      setSelectedSlot(null); // Deselect suggested
    }
  };

  // Active proposal (for footer)
  const activeProposal = useMemo(() => {
    if (selectionMode === 'suggested' && selectedSlot) {
      return selectedSlot;
    }
    if (selectionMode === 'manual' && manualDate && manualTime && availabilityStatus === 'available') {
      const [hours, minutes] = manualTime.split(':').map(Number);
      const start = setMinutes(setHours(manualDate, hours), minutes);
      const end = addMinutes(start, slotDuration);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    return null;
  }, [selectionMode, selectedSlot, manualDate, manualTime, availabilityStatus, slotDuration]);

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

  const handleSubmit = () => {
    if (!activeProposal || !request) return;
    onSubmit(request.id, activeProposal.start, activeProposal.end);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-[980px] w-[calc(100vw-32px)] max-h-[85vh] grid grid-rows-[auto_1fr_auto]">
        {/* HEADER (sticky) */}
        <div className="bg-background border-b px-6 py-4 shrink-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold">
              Proponi un nuovo orario
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Il cliente potrà accettare o rifiutare la tua proposta.
            </p>
            {originalStart && originalEnd && (
              <div className="pt-1">
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 text-sm font-normal rounded-full"
                >
                  Richiesta: {format(originalStart, "EEE d MMM", { locale: it })} · 
                  {format(originalStart, "HH:mm")}–{format(originalEnd, "HH:mm")}
                </Badge>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* BODY (single scroll container, split layout) */}
        <div className="min-h-0 overflow-y-auto">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            
            {/* LEFT PANEL: Fast Path - Suggested slots */}
            <div className="px-6 py-5 bg-background lg:border-r">
              {/* Section header */}
              <div className="space-y-1 mb-4">
                <h3 className="text-base font-semibold">Orari suggeriti</h3>
                <p className="text-sm text-muted-foreground">
                  Suggeriti in base alla tua agenda. Puoi anche proporre un altro orario.
                </p>
              </div>
              
              {/* Suggested slots grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedSlotSelect(slot)}
                    className={cn(
                      "relative rounded-xl border bg-background px-4 py-3 text-left transition-all",
                      "hover:bg-muted/40",
                      isSlotSelected(slot) && selectionMode === 'suggested'
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    {/* Check icon top-right when selected */}
                    {isSlotSelected(slot) && selectionMode === 'suggested' && (
                      <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm text-muted-foreground block">
                      {formatSlotDate(slot)}
                    </span>
                    <span className="text-base font-semibold text-foreground block">
                      {formatSlotTime(slot)}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Empty state */}
              {suggestedSlots.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nessun orario suggerito disponibile nei prossimi 14 giorni.
                </p>
              )}
            </div>
            
            {/* MOBILE DIVIDER */}
            <div className="border-t lg:hidden" />
            
            {/* RIGHT PANEL: Power Path - Manual proposal */}
            <div className="px-6 py-5 bg-muted/20 lg:border-l">
              {/* Section header */}
              <div className="space-y-1 mb-4">
                <h3 className="text-base font-semibold">Proponi un orario diverso</h3>
                <p className="text-sm text-muted-foreground">
                  Puoi proporre qualsiasi giorno e orario. Verificheremo la disponibilità in tempo reale.
                </p>
              </div>
              
              {/* Calendar (date only) */}
              <CalendarComponent
                mode="single"
                selected={manualDate}
                onSelect={handleManualDateChange}
                disabled={(date) => date < startOfDay(new Date()) || date > rangeEnd}
                className="rounded-md border bg-background mx-auto pointer-events-auto"
                locale={it}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Seleziona una data, poi imposta l'orario.
              </p>
              
              {/* Time Picker */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium">Ora</Label>
                <div className="max-w-[220px]">
                  <TimePicker
                    value={manualTime}
                    onChange={handleManualTimeChange}
                    placeholder="Seleziona orario"
                  />
                </div>
              </div>
              
              {/* Quick chips for common times */}
              <div className="flex flex-wrap gap-2 mt-3">
                {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleManualTimeChange(time)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted transition-colors",
                      manualTime === time && "border-primary bg-primary/5"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              
              {/* Availability Status (fixed height to prevent layout jump) */}
              <div className="mt-4 min-h-[72px]">
                {/* Loading */}
                {availabilityStatus === 'loading' && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifico disponibilità…
                  </div>
                )}
                
                {/* Available */}
                {availabilityStatus === 'available' && (
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Disponibile
                  </div>
                )}
                
                {/* Conflict */}
                {availabilityStatus === 'conflict' && conflictEvent && (
                  <div className="rounded-md border border-rose-200 bg-rose-50/50 px-3 py-2 space-y-2">
                    <div className="flex items-start gap-1.5 text-sm text-rose-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        In conflitto con "{conflictEvent.title}" 
                        ({format(parseISO(conflictEvent.start), "HH:mm")}–
                        {format(parseISO(conflictEvent.end), "HH:mm")})
                      </span>
                    </div>
                    
                    {/* Alternative chips - SHOW DATE + TIME (micro-fix #1) */}
                    {alternativeSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {alternativeSlots.map((alt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const altDate = parseISO(alt.start);
                              setManualDate(startOfDay(altDate));
                              setManualTime(format(altDate, "HH:mm"));
                            }}
                            className="text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted"
                          >
                            {format(parseISO(alt.start), "EEE d MMM", { locale: it })} · 
                            {format(parseISO(alt.start), "HH:mm")}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* FOOTER (sticky) */}
        <div className="border-t bg-background px-6 py-4 shrink-0">
          {activeProposal ? (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Nuova proposta: <span className="font-medium text-foreground">
                  {format(parseISO(activeProposal.start), "EEE d MMM", { locale: it })} · 
                  {format(parseISO(activeProposal.start), "HH:mm")}–
                  {format(parseISO(activeProposal.end), "HH:mm")}
                </span>
              </p>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="h-11 w-full"
              >
                Invia controproposta
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button disabled className="h-11 w-full">
                Invia controproposta
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Seleziona un orario suggerito oppure scegli data e ora.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
