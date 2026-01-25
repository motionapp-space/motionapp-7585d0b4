
# Piano UI: Gestione Prenotazioni — 10/10 Edition

## Sintesi delle 5 Micro-Migliorie

| # | Area | Fix |
|---|------|-----|
| 1 | Data/ora | Rimuovere `capitalize` (output date-fns già formattato) |
| 2 | Header card | `bg-muted/30` invece di `bg-primary/5` (meno "alert-like") |
| 3 | Rifiuta | Aggiungere conferma leggera con Popover |
| 4 | Modale | Mostrare slot disponibili dopo selezione giorno (già implementato!) |
| 5 | CTA disabilitata | Feedback di selezione parziale |

---

## 1. PendingRequestCard.tsx — Refactor Completo

### File: `src/features/bookings/components/PendingRequestCard.tsx`

### Modifiche Strutturali

#### A) Header — `bg-muted/30` (Fix #2)

```typescript
// PRIMA (attuale)
<div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 border-b border-blue-100 dark:border-blue-900/50">

// DOPO
<div className="bg-muted/30 px-4 py-2.5 border-b">
  <Badge className="bg-primary hover:bg-primary text-primary-foreground font-medium">
    Da approvare
  </Badge>
  {/* RIMUOVERE "Azione richiesta" */}
</div>
```

#### B) Data/Ora Primaria — Senza `capitalize` (Fix #1)

```typescript
// Formato compatto senza capitalize
const formattedDateCompact = format(startDate, "EEE d MMM", { locale: it });
const formattedTimeRange = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

// Rendering (SENZA capitalize)
<p className="text-lg font-semibold text-foreground">
  {formattedDateCompact} · {formattedTimeRange}
</p>
```

#### C) Gerarchia Informazioni — Invertita

```typescript
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
```

#### D) Azioni con Conferma per Rifiuta (Fix #3)

Nuovo import necessario:
```typescript
import { ArrowLeftRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
```

Nuovo state:
```typescript
const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false);
```

Layout azioni:
```typescript
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

  {/* Link distruttivo CON conferma */}
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
```

---

## 2. CounterProposeDialog.tsx — Micro-Migliorie

### File: `src/features/bookings/components/CounterProposeDialog.tsx`

### A) Header con Subtitle Guida

```typescript
// PRIMA (righe 172-184)
<DialogHeader className="space-y-1">
  <DialogTitle className="text-base font-medium">
    Proponi nuovo orario
  </DialogTitle>
  ...
</DialogHeader>

// DOPO
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
```

### B) Sezione Suggeriti con Sottotitolo Guida

```typescript
// PRIMA (righe 190-194)
<div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
  <Sparkles className="h-4 w-4" />
  Orari consigliati
</div>

// DOPO
<div className="space-y-1 mb-3">
  <div className="flex items-center gap-2 text-sm font-medium text-primary">
    <Sparkles className="h-4 w-4" />
    Orari suggeriti
  </div>
  <p className="text-xs text-muted-foreground">
    Suggeriti in base alla tua disponibilità. Puoi anche scegliere un giorno e orario diverso.
  </p>
</div>
```

### C) Rimuovere `capitalize` dagli slot suggeriti (Fix #1)

```typescript
// PRIMA (riga 211)
<span className="text-xs text-muted-foreground capitalize">

// DOPO
<span className="text-xs text-muted-foreground">
```

### D) Titolo sezione calendario

```typescript
// PRIMA (righe 228-231)
<div className="flex items-center gap-2 text-sm font-medium mb-2">
  <Calendar className="h-4 w-4 text-muted-foreground" />
  Scegli un giorno alternativo
</div>

// DOPO
<p className="text-sm font-medium text-foreground mb-3">
  Scegli un giorno alternativo
</p>
```

### E) Sezione Time Slots — Titolo senza `capitalize` (Fix #1)

```typescript
// PRIMA (riga 261)
<span className="capitalize">
  {format(selectedDate, "EEEE d MMMM", { locale: it })}
</span>

// DOPO
<span>
  Orari disponibili
</span>
```

### F) Placeholder quando nessun giorno selezionato (Fix #4)

Aggiungere prima della sezione time slots (prima di riga 257):

```typescript
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
  // ... contenuto esistente
)}
```

### G) Footer CTA con Feedback Selezione Parziale (Fix #5)

```typescript
// PRIMA (righe 367-370)
<Button disabled className="w-full" size="lg">
  Seleziona un orario
</Button>

// DOPO
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
```

### H) Footer CTA quando completo — Label uniformata

```typescript
// PRIMA (righe 352-365)
<div className="space-y-2">
  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
    <Check className="h-4 w-4 text-green-600" />
    Proposta pronta per l'invio
  </div>
  <Button ...>
    Proponi · {formatSlotDate(selectedSlot)} · {formatSlotTime(selectedSlot)}
  </Button>
</div>

// DOPO
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
```

---

## 3. BookingManagement.tsx — Micro-copy Update

### File: `src/pages/BookingManagement.tsx`

```typescript
// PRIMA (riga ~145)
<CardDescription>
  Approva, rifiuta o controproponi un'altra data
</CardDescription>

// DOPO
<CardDescription>
  Approva, rifiuta o proponi un altro orario ai tuoi clienti.
</CardDescription>
```

---

## Riepilogo Modifiche

| File | Modifiche |
|------|-----------|
| `PendingRequestCard.tsx` | Header `bg-muted/30`, gerarchia invertita, no `capitalize`, azioni visibili, Popover conferma rifiuto |
| `CounterProposeDialog.tsx` | Subtitle header, sottotitolo suggeriti, no `capitalize`, placeholder pre-selezione, feedback parziale CTA |
| `BookingManagement.tsx` | Micro-copy sezione |

---

## Risultato UX Finale

Il coach vedrà:
1. Card pulita con data/ora immediatamente leggibile (senza strane capitalizzazioni)
2. Header neutro `bg-muted/30` che non urla "alert"
3. Tre azioni chiare: Approva (primary) > Controproponi (outline) > Rifiuta (link con conferma)
4. Modale guidata con placeholder e feedback di progresso
5. Zero rischio di rifiutare per errore grazie al Popover di conferma
