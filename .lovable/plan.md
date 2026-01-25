
# Piano: CounterProposeDialog — Layout Verticale Decision-First con Availability Live

## Obiettivo

Riprogettare completamente la modale `CounterProposeDialog` per il coach con:
- **Fast Path**: selezione rapida di Orari suggeriti (basati sull'agenda)
- **Power Path**: scelta libera di qualsiasi giorno + qualsiasi ora, con availability check live
- **Layout verticale** (no split), con header e footer sticky e solo body scrollabile
- CTA "Invia controproposta" abilitata solo quando esiste una proposta valida

---

## File Target

`src/features/bookings/components/CounterProposeDialog.tsx`

---

## Confronto Layout Attuale vs Nuovo

```text
ATTUALE (max-w-md, sezioni frammentate):
┌────────────────────────────────────┐
│ Header (bg-muted/50)               │
├────────────────────────────────────┤
│ Suggested slots (bg-primary/5)     │
├────────────────────────────────────┤
│ Calendar                           │
├────────────────────────────────────┤
│ Time slots (grid 3 col)            │
│ + Collapsible "mostra più"         │
├────────────────────────────────────┤
│ Footer CTA                         │
└────────────────────────────────────┘

NUOVO (max-w-[720px], verticale, decision-first):
┌──────────────────────────────────────────────────┐
│ HEADER (sticky, bg-background border-b)          │
│ Proponi un nuovo orario                          │
│ [Richiesta: lun 12 gen · 10:00–11:00]            │
├──────────────────────────────────────────────────┤
│ BODY (single scroll)                             │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ SEZIONE 1: Orari suggeriti                   │ │
│ │ ┌────────────┐ ┌────────────┐                │ │
│ │ │ mar 27 gen │ │ mer 28 gen │ ← radio-cards  │ │
│ │ │ 10:00–11:00│ │ 09:00–10:00│   con check    │ │
│ │ └────────────┘ └────────────┘                │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ────────────── divider ──────────────            │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ SEZIONE 2: Scegli data e ora                 │ │
│ │ (Power path container bg-muted/20)           │ │
│ │                                              │ │
│ │ ┌─────────────────┐  ┌────────────────────┐  │ │
│ │ │   CALENDARIO    │  │ Ora: [TimePicker]  │  │ │
│ │ └─────────────────┘  │ [09:00][10:00]...  │  │ │
│ │                      └────────────────────┘  │ │
│ │                                              │ │
│ │ ✓ Disponibile / ⚠ In conflitto con...       │ │
│ │ [mar 28 · 11:00] [mer 29 · 09:00]            │ │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ FOOTER (sticky)                                  │
│ Nuova proposta: mar 27 gen · 10:00–11:00         │
│ [          Invia controproposta          ]       │
└──────────────────────────────────────────────────┘
```

---

## Nuove Dipendenze/Import

```tsx
// Aggiungere/modificare import:
import { useState, useMemo, useEffect } from "react";
import { format, startOfDay, addDays, parseISO, addMinutes, setHours, setMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { useDebounce } from "@/hooks/use-debounce";

// Rimuovere import non più utilizzati:
// Clock, ChevronDown, ChevronUp, Check, Sparkles
// Collapsible, CollapsibleContent, CollapsibleTrigger
```

---

## Nuovo State (oltre agli esistenti)

```tsx
// Mantieni: selectedSlot, settings, windows, oooBlocks, events, etc.
// Rimuovi: selectedDate, showAllSlots

// Aggiungi:
const [selectionMode, setSelectionMode] = useState<'suggested' | 'manual' | null>(null);
const [manualDate, setManualDate] = useState<Date | undefined>(undefined);
const [manualTime, setManualTime] = useState<string>(""); // "HH:mm"

// Availability check live:
const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'loading' | 'available' | 'conflict'>('idle');
const [conflictEvent, setConflictEvent] = useState<{ title: string; start: string; end: string } | null>(null);
const [alternativeSlots, setAlternativeSlots] = useState<AvailableSlot[]>([]);

// Debounce:
const debouncedManualDate = useDebounce(manualDate, 300);
const debouncedManualTime = useDebounce(manualTime, 300);
```

---

## Logica Selezione Coerente

### Fast Path (slot suggerito)

```tsx
const handleSuggestedSlotSelect = (slot: AvailableSlot) => {
  setSelectedSlot(slot);
  setSelectionMode('suggested');
  // Reset manual selection
  setManualDate(undefined);
  setManualTime("");
  // Reset availability
  setAvailabilityStatus('idle');
  setConflictEvent(null);
  setAlternativeSlots([]);
};
```

### Power Path (manuale)

```tsx
const handleManualDateChange = (date: Date | undefined) => {
  setManualDate(date);
  if (date) {
    setSelectionMode('manual');
    setSelectedSlot(null); // Deseleziona suggested
  }
};

const handleManualTimeChange = (time: string) => {
  setManualTime(time);
  setSelectionMode('manual');
  setSelectedSlot(null); // Deseleziona suggested
};
```

---

## Availability Check Live (useEffect)

```tsx
useEffect(() => {
  // Reset se non ho entrambi date e time
  if (!debouncedManualDate || !debouncedManualTime) {
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

  // Check conflitti con eventi esistenti (ignora cancellati)
  const conflicting = events.find(event => {
    if (event.session_status === 'canceled') return false;
    const eventStart = parseISO(event.start_at);
    const eventEnd = parseISO(event.end_at);
    // Overlap: proposedStart < eventEnd AND proposedEnd > eventStart
    return (proposedStart < eventEnd && proposedEnd > eventStart);
  });

  if (conflicting) {
    setAvailabilityStatus('conflict');
    setConflictEvent({
      title: conflicting.title || 'Appuntamento',
      start: conflicting.start_at,
      end: conflicting.end_at
    });
    // Trova 3 alternative (già disponibili da allSlotsFor14Days + findNearestSlots)
    const alternatives = findNearestSlots(proposedStart, allSlotsFor14Days).slice(0, 3);
    setAlternativeSlots(alternatives);
  } else {
    setAvailabilityStatus('available');
    setConflictEvent(null);
    setAlternativeSlots([]);
  }
}, [debouncedManualDate, debouncedManualTime, events, slotDuration, allSlotsFor14Days]);
```

---

## activeProposal (useMemo per footer CTA)

```tsx
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

## handleSubmit aggiornato

```tsx
const handleSubmit = () => {
  if (!activeProposal || !request) return;
  onSubmit(request.id, activeProposal.start, activeProposal.end);
};
```

---

## Struttura JSX Completa

### 1. DialogContent (grid 3 righe per sticky header/footer)

```tsx
<DialogContent className="max-w-[720px] w-[calc(100vw-32px)] max-h-[85vh] p-0 gap-0 grid grid-rows-[auto_1fr_auto] overflow-hidden">
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

### 3. Body (unico scroll container, layout verticale)

```tsx
<div className="min-h-0 overflow-y-auto">
  <div className="px-6 py-5 space-y-6">
    
    {/* SEZIONE 1: Orari suggeriti (FAST PATH) */}
    <div>
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-semibold">Orari suggeriti</h3>
        <p className="text-sm text-muted-foreground">
          Suggeriti in base alla tua agenda. Se preferisci, puoi scegliere qualsiasi data e ora qui sotto.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestedSlots.map((slot, idx) => {
          const selected = isSlotSelected(slot) && selectionMode === 'suggested';
          return (
            <button
              key={idx}
              onClick={() => handleSuggestedSlotSelect(slot)}
              className={cn(
                "relative rounded-xl border bg-background px-4 py-3 text-left transition-all",
                "hover:bg-muted/40",
                selected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              {selected && (
                <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
              )}
              <span className="text-sm text-muted-foreground block">
                {formatSlotDate(slot)}
              </span>
              <span className="text-base font-semibold text-foreground block">
                {formatSlotTime(slot)}
              </span>
            </button>
          );
        })}
      </div>
      
      {suggestedSlots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nessun orario suggerito disponibile.
        </p>
      )}
    </div>
    
    {/* DIVIDER */}
    <div className="border-t" />
    
    {/* SEZIONE 2: Scegli data e ora (POWER PATH) */}
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-semibold">Scegli data e ora</h3>
        <p className="text-sm text-muted-foreground">
          Puoi proporre qualsiasi giorno e qualsiasi ora. Ti segnaleremo eventuali conflitti con la tua agenda.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Calendario */}
        <div className="flex-shrink-0">
          <CalendarComponent
            mode="single"
            selected={manualDate}
            onSelect={handleManualDateChange}
            disabled={(date) => date < startOfDay(new Date())}
            className="rounded-md border bg-background pointer-events-auto"
            locale={it}
          />
        </div>
        
        {/* Time picker + quick chips */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ora</Label>
            <div className="max-w-[220px]">
              <TimePicker
                value={manualTime}
                onChange={handleManualTimeChange}
                placeholder="Seleziona orario"
              />
            </div>
          </div>
          
          {/* Quick chips */}
          <div className="flex flex-wrap gap-2">
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
          <div className="min-h-[72px]">
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
                
                {/* Alternative chips - MOSTRANO DATA + ORA */}
                {alternativeSlots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {alternativeSlots.map((alt, idx) => {
                      const altStart = parseISO(alt.start);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectionMode('manual');
                            setSelectedSlot(null);
                            setManualDate(altStart);
                            setManualTime(format(altStart, "HH:mm"));
                          }}
                          className="text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted"
                        >
                          {format(altStart, "EEE d MMM", { locale: it })} · {format(altStart, "HH:mm")}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

| Area | Modifica |
|------|----------|
| **Import (1-25)** | Aggiungere setHours, setMinutes, addMinutes, CheckCircle2, AlertTriangle, Loader2, Label, TimePicker, useDebounce. Rimuovere Clock, ChevronDown, ChevronUp, Check, Sparkles, Collapsible |
| **State (42-46)** | Rimuovere selectedDate, showAllSlots. Aggiungere selectionMode, manualDate, manualTime, availability state, debounced values |
| **Hooks (~107)** | Aggiungere useEffect per availability check live |
| **Handlers (~143)** | Aggiungere handleSuggestedSlotSelect, handleManualDateChange, handleManualTimeChange. Rimuovere logica dateHasSlots |
| **Memoized (~172)** | Aggiungere activeProposal. Rimuovere displaySlots, hasMoreSlots |
| **handleSubmit** | Usare activeProposal invece di selectedSlot |
| **DialogContent (168)** | `max-w-[720px] w-[calc(100vw-32px)] max-h-[85vh]` |
| **Header (169-186)** | `bg-background border-b px-6 py-4`, Badge con `rounded-full` |
| **Body (188-360)** | Layout verticale, due sezioni (suggested + manual), power path in container `bg-muted/20` |
| **Footer (362-400)** | Logica activeProposal, CTA `h-11 w-full` |

---

## Componenti Riutilizzati

| Componente | Fonte | Utilizzo |
|------------|-------|----------|
| `TimePicker` | `@/components/ui/time-picker` | Selezione ora manuale |
| `useDebounce` | `@/hooks/use-debounce` | Debounce per availability check |
| `findNearestSlots` | `../utils/slot-generator` | Alternative slot in caso di conflitto |
| `allSlotsFor14Days` | Già presente nel file | Pool di slot per alternative |

---

## Design System Alignment

| Elemento | Classe |
|----------|--------|
| **Modal width** | `max-w-[720px] w-[calc(100vw-32px)]` |
| **Header/Footer padding** | `px-6 py-4` |
| **Body padding** | `px-6 py-5` |
| **Titoli sezioni** | `text-base font-semibold` |
| **Sottotitoli** | `text-sm text-muted-foreground` |
| **Slot card** | `rounded-xl border px-4 py-3 hover:bg-muted/40` |
| **Selected slot** | `border-primary bg-primary/5` |
| **Power path container** | `rounded-xl border bg-muted/20 p-4` |
| **Available text** | `text-emerald-600` |
| **Conflict box** | `border-rose-200 bg-rose-50/50 text-rose-700` |
| **Quick chips** | `text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted` |
| **CTA button** | `h-11 w-full` |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| **Mobile (<640px)** | Calendario e time picker stacked verticalmente (`flex-col`) |
| **Desktop (≥640px)** | Calendario e time picker side-by-side (`sm:flex-row`) |

---

## Checklist Finale

| Requisito | Implementazione |
|-----------|-----------------|
| Layout verticale (no split) | Single column con sezioni stacked |
| Header/footer sticky, body single scroll | `grid-rows-[auto_1fr_auto]`, body con `min-h-0 overflow-y-auto` |
| Coach può scegliere qualsiasi data/ora | Calendario non disabilita date (solo passato), TimePicker libero |
| Availability live con 3 stati | loading/available/conflict + conflictEvent dettagliato |
| Alternative slot mostrano data + ora | Format completo `EEE d MMM · HH:mm` |
| Reset coerente tra suggested/manual | selectionMode traccia quale path è attivo |
| CTA abilitata solo con activeProposal valido | suggested: selectedSlot; manual: date+time+available |
| Modale non vuota | `max-w-[720px]` invece di `max-w-md` |
| Tipografia/spaziature Motion | text-base font-semibold / text-sm muted / px-6 py-4/5 |
