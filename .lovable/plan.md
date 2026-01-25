

# Piano: PendingRequestCard Compatta — Layout Orizzontale

## Obiettivo

Ridurre l'altezza della card del ~35-45% passando da layout **verticale stacked** a **orizzontale 2-righe** con azioni sulla destra.

## Confronto Visivo

### PRIMA (Attuale — Stacked)
```text
┌─────────────────────────────────────┐
│ 🔵 Da approvare                     │  ← Header separato
├─────────────────────────────────────┤
│ lun 12 gen · 10:00–11:00            │  ← Riga 1
│ 🔴 Matthew Count                     │  ← Riga 2
│ Lezione singola · 60 min            │  ← Riga 3
│ "Note opzionali..."                 │  ← Riga 4 (opzionale)
├─────────────────────────────────────┤
│ [Approva] [Controproponi]           │  ← Azioni separate
│       Rifiuta richiesta             │
└─────────────────────────────────────┘
```

### DOPO (Compatto — Orizzontale)
```text
┌──────────────────────────────────────────────────────────────┐
│ ← INFO (flex-1)                        → AZIONI (shrink-0)   │
│                                                              │
│ 🔵 Da approvare  lun 12 gen · 10:00–11:00                    │
│ 🔴 Matthew Count · Lezione singola · 60 min    [✓] [↔]       │
│ "Note opzionali..."                             Rifiuta      │
└──────────────────────────────────────────────────────────────┘
```

---

## Struttura JSX Target

```text
Card
└── CardContent (p-4)
    └── flex items-start gap-4
        ├── LEFT (flex-1 min-w-0 space-y-1.5)
        │   ├── Riga 1: Badge + Data/Ora (flex items-center gap-2)
        │   ├── Riga 2: ClientDot + Nome + " · " + Tipo + Durata
        │   └── Riga 3: Note (opzionale, compatte)
        │
        └── RIGHT (shrink-0 flex flex-col items-end gap-2)
            ├── Row: [Approva sm] [Controproponi sm outline]
            └── Rifiuta (text link + Popover conferma)
```

---

## Modifiche al File

**File**: `src/features/bookings/components/PendingRequestCard.tsx`

### Cambiamenti Chiave

| Area | Prima | Dopo |
|------|-------|------|
| **Layout** | Stacked verticale | Orizzontale con `flex items-start gap-4` |
| **Header** | Separato con `border-b` | Badge inline con data/ora |
| **Info** | 4 elementi separati | 2 righe compatte |
| **Azioni** | Full-width sotto | Colonna destra, size `sm` |
| **Note** | Box `bg-muted/50 p-2.5` | Inline `italic` senza box |
| **Altezza** | ~180-200px | ~80-100px |

### Codice Completo

```tsx
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
        
        {/* Rifiuta con Popover conferma (MANTENUTO) */}
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
```

---

## Micro-Tuning Inclusi

| Fix | Implementazione |
|-----|-----------------|
| **Icone più piccole** | `h-3.5 w-3.5` invece di `h-4 w-4` |
| **Button size** | `size="sm"` per ridurre altezza |
| **Badge compatto** | `text-xs` |
| **Note senza box** | `italic truncate` invece di `bg-muted/50 p-2.5` |
| **Popover mantenuto** | Conferma "Rifiuta" con align `end` |
| **Truncate** | Su nome cliente e note per evitare overflow |

---

## Responsive Behavior

Il layout è progettato per funzionare su desktop. Su mobile molto stretto, le azioni potrebbero "wrappare" sotto le info, ma il `min-w-0` e `truncate` prevengono overflow.

---

## Risultato Atteso

| Metrica | Prima | Dopo |
|---------|-------|------|
| **Altezza card** | ~180px | ~85px |
| **Riduzione** | — | **~53%** |
| **Scan visivo** | 3-4 secondi | <2 secondi |
| **Densità lista** | 3-4 card visibili | 6-8 card visibili |

Il coach può processare più richieste senza scroll eccessivo.

