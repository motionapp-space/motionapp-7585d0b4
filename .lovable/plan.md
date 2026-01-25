

# Piano: CounterProposeDialog — Decision-First Split Layout con Availability Live

## Obiettivo

Riprogettare completamente la modale `CounterProposeDialog` per il coach con:
- **Fast Path**: selezione rapida di Orari suggeriti (basati sull'agenda)
- **Power Path**: scelta libera di qualsiasi giorno + qualsiasi ora, con availability check live
- Split layout desktop (due pannelli affiancati), stacked mobile
- Header e footer sticky, corpo scrollabile (evitare doppio scroll)
- Design coerente Motion (stessa gerarchia font/spaziature di Impostazioni)

---

## File Target

`src/features/bookings/components/CounterProposeDialog.tsx`

---

## Confronto Layout Attuale vs Nuovo

```text
ATTUALE (single column, modal stretta):
┌────────────────────────────────────┐
│ Header                             │
├────────────────────────────────────┤
│ Orari suggeriti (grid 2 col)       │
├────────────────────────────────────┤
│ Calendario                         │
├────────────────────────────────────┤
│ Orari disponibili (grid 3 col)     │
├────────────────────────────────────┤
│ Footer CTA                         │
└────────────────────────────────────┘

NUOVO (split layout, modal larga):
DESKTOP (≥1024px):
┌──────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                                                  │
│ Proponi un nuovo orario                                                          │
│ [Richiesta: lun 12 gen · 10:00–11:00]                                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│  FAST PATH (1.4fr)                │  POWER PATH (1fr)                            │
│  Orari suggeriti                  │  Proponi un orario diverso                   │
│  ┌────────────┐ ┌────────────┐    │  ┌──────────────────────────────┐            │
│  │ mar 27 gen │ │ mer 28 gen │    │  │      CALENDARIO              │            │
│  │ 10:00–11:00│ │ 09:00–10:00│    │  └──────────────────────────────┘            │
│  └────────────┘ └────────────┘    │  Ora: [TimePicker]                           │
│  ┌────────────┐ ┌────────────┐    │  [09:00] [10:00] [11:00]                     │
│  │ gio 29 gen │ │ ven 30 gen │    │                                              │
│  │ 14:00–15:00│ │ 11:00–12:00│    │  ✓ Disponibile / ⚠ In conflitto...          │
│  └────────────┘ └────────────┘    │                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER (sticky)                                                                  │
│ Nuova proposta: mar 27 gen · 10:00–11:00                                         │
│ [                    Invia controproposta                    ]                   │
└──────────────────────────────────────────────────────────────────────────────────┘

MOBILE (<1024px):
┌──────────────────────────────────┐
│ HEADER (sticky)                  │
├──────────────────────────────────┤
│ Orari suggeriti (grid 2 col)     │
├──────────────────────────────────┤ ← border-t separator
│ Proponi un orario diverso        │
│ [CALENDARIO]                     │
│ Ora: [TimePicker]                │
│ [Availability status]            │
├──────────────────────────────────┤
│ FOOTER (sticky)                  │
└──────────────────────────────────┘
```

---

## Nuove Dipendenze/Import

```tsx
// Aggiungere agli import esistenti:
import { useState, useMemo, useEffect } from "react";
import { setHours, setMinutes } from "date-fns"; // aggiungere a date-fns
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"; // aggiungere icone
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { useDebounce } from "@/hooks/use-debounce";
```

---

## Nuovo State (oltre agli esistenti)

```tsx
// Selection mode per gestire fast vs power path
const [selectionMode, setSelectionMode] = useState<'suggested' | 'manual' | null>(null);

// Manual selection (power path)
const [manualDate, setManualDate] = useState<Date | undefined>(undefined);
const [manualTime, setManualTime] = useState<string>(""); // "HH:mm"

// Availability check live
const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'loading' | 'available' | 'conflict'>('idle');
const [conflictEvent, setConflictEvent] = useState<{ title: string; start: string; end: string } | null>(null);
const [alternativeSlots, setAlternativeSlots] = useState<AvailableSlot[]>([]);

// Debounce per evitare check troppo frequenti
const debouncedManualDate = useDebounce(manualDate, 300);
const debouncedManualTime = useDebounce(manualTime, 300);
```

---

## Logica Availability Check Live

```tsx
useEffect(() => {
  // Reset se non ho entrambi date e time
  if (!debouncedManualDate || !debouncedManualTime || !settings) {
    setAvailabilityStatus('idle');
    setConflictEvent(null);
    setAlternativeSlots([]);
    return;
  }

  setAvailabilityStatus('loading');
  
  // Costruisci datetime dalla date + time
  const [hours, minutes] = debouncedManualTime.split(':').map(Number);
  const proposedStart = setMinutes(setHours(debouncedManualDate, hours), minutes);
  const proposedEnd = addMinutes(proposedStart, slotDuration);

  // Check conflitti con eventi esistenti
  const conflicting = events.find(event => {
    if (event.session_status === 'canceled') return false; // ignora cancellati
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
    // Trova 3 alternative vicine usando allSlotsFor14Days esistente
    const alternatives = findNearestSlots(proposedStart, allSlotsFor14Days).slice(0, 3);
    setAlternativeSlots(alternatives);
  } else {
    setAvailabilityStatus('available');
    setConflictEvent(null);
    setAlternativeSlots([]);
  }
}, [debouncedManualDate, debouncedManualTime, events, settings, slotDuration, allSlotsFor14Days]);
```

---

## Logica Selezione Coerente

```tsx
// Quando seleziono slot suggerito (FAST PATH):
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

// Quando modifico manual date (POWER PATH):
const handleManualDateChange = (date: Date | undefined) => {
  setManualDate(date);
  if (date) {
    setSelectionMode('manual');
    setSelectedSlot(null); // Deseleziona suggested
  }
};

// Quando modifico manual time (POWER PATH):
const handleManualTimeChange = (time: string) => {
  setManualTime(time);
  if (manualDate && time) {
    setSelectionMode('manual');
    setSelectedSlot(null); // Deseleziona suggested
  }
};

// Proposta attiva (per footer)
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
```

---

## Struttura JSX Completa

### 1. DialogContent (grid 3 righe per sticky header/footer)

```tsx
<DialogContent className="p-0 overflow-hidden max-w-[980px] w-[calc(100vw-32px)] max-h-[85vh] grid grid-rows-[auto_1fr_auto]">
```

### 2. Header (sticky)

```tsx
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
```

### 3. Body (unico scroll container, split layout)

```tsx
<div className="min-h-0 overflow-y-auto">
  <div className="grid lg:grid-cols-[1.4fr_1fr]">
    
    {/* PANNELLO SINISTRO: Fast Path - Orari suggeriti */}
    <div className="px-6 py-5 bg-background lg:border-r">
      {/* Header sezione */}
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-semibold">Orari suggeriti</h3>
        <p className="text-sm text-muted-foreground">
          Suggeriti in base alla tua agenda. Puoi anche proporre un altro orario.
        </p>
      </div>
      
      {/* Grid slot suggeriti */}
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
            {/* Check icon top-right quando selezionato */}
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
    
    {/* DIVIDER mobile */}
    <div className="border-t lg:hidden" />
    
    {/* PANNELLO DESTRO: Power Path - Proposta manuale */}
    <div className="px-6 py-5 bg-muted/20 lg:border-l">
      {/* Header sezione */}
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-semibold">Proponi un orario diverso</h3>
        <p className="text-sm text-muted-foreground">
          Puoi proporre qualsiasi giorno e orario. Verificheremo la disponibilità in tempo reale.
        </p>
      </div>
      
      {/* Calendario (solo data) */}
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
      
      {/* Quick chips orari comuni */}
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
      
      {/* Availability Status (altezza fissa per evitare jump) */}
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
            
            {/* Alternative chips - MOSTRANO DATA + ORA (micro-fix #1) */}
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
```

### 4. Footer (sticky)

```tsx
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
```

---

## Riepilogo Modifiche per Riga

| Riga | Modifica |
|------|----------|
| 1-26 | Aggiungere nuovi import (setHours, setMinutes, CheckCircle2, AlertTriangle, Loader2, Label, TimePicker, useDebounce) |
| 42-46 | Nuovo state: selectionMode, manualDate, manualTime |
| 47-52 | Nuovo state: availabilityStatus, conflictEvent, alternativeSlots |
| 53-54 | Debounced values |
| 107-140 | Nuovo useEffect per availability check live |
| 142-170 | Nuove funzioni handler (handleSuggestedSlotSelect, handleManualDateChange, handleManualTimeChange) |
| 172-185 | Nuovo useMemo per activeProposal |
| 166-168 | Modificare DialogContent className per split layout |
| 169-186 | Header aggiornato (bg-background, border-b, px-6 py-4) |
| 188-360 | Body completamente ristrutturato con split layout |
| 362-400 | Footer aggiornato con logica activeProposal |

---

## 3 Micro-Fix UX Critici

| # | Fix | Implementazione |
|---|-----|-----------------|
| 1 | Alternative slot mostrano DATA + ORA | `{format(parseISO(alt.start), "EEE d MMM", { locale: it })} · {format(parseISO(alt.start), "HH:mm")}` |
| 2 | activeProposal solo se manual + available | `selectionMode === 'manual' && availabilityStatus === 'available'` |
| 3 | No doppio scroll | Body wrapper unico con `min-h-0 overflow-y-auto`, pannelli senza overflow proprio |

---

## Design System Alignment

| Elemento | Classe |
|----------|--------|
| **Titoli sezioni** | `text-base font-semibold` |
| **Sottotitoli** | `text-sm text-muted-foreground` |
| **Slot time** | `text-base font-semibold text-foreground` |
| **Slot date** | `text-sm text-muted-foreground` |
| **Padding pannelli** | `px-6 py-5` |
| **Padding header/footer** | `px-6 py-4` |
| **Available text** | `text-emerald-600` |
| **Conflict box** | `border-rose-200 bg-rose-50/50 text-rose-700` |
| **Quick chips** | `text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted` |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| **Mobile (<1024px)** | Pannelli stacked verticalmente, separatore `border-t lg:hidden` |
| **Desktop (≥1024px)** | Split `lg:grid-cols-[1.4fr_1fr]`, pannelli side-by-side |

---

## Checklist Finale

| Requisito | Implementazione |
|-----------|-----------------|
| Split desktop (lg:grid-cols-[1.4fr_1fr]) | Grid responsive con pannelli affiancati |
| Stacked mobile + divider | `border-t lg:hidden` tra pannelli |
| Header/footer sticky, body unico scroll | `grid-rows-[auto_1fr_auto]`, body con `min-h-0 overflow-y-auto` |
| Coach può scegliere qualsiasi data/ora | Calendario non disabilita date, TimePicker libero |
| Availability live con 3 stati | loading/available/conflict + conflictEvent dettagliato |
| Alternative slot mostrano data + ora | Format completo `EEE d MMM · HH:mm` |
| CTA coerente con activeProposal | Abilitata solo se suggested selezionato O (manual + available) |
| Tipografia/spaziature Motion | text-base font-semibold / text-sm muted / px-6 py-4/5 |

