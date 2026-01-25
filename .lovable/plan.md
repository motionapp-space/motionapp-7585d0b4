

# Piano: PendingRequestCard — Versione Finale 10/10

## 2 Micro-Fix Aggiunti

| # | Fix | Codice |
|---|-----|--------|
| 1 | Badge non cliccabile | `pointer-events-none` aggiunto al Badge |
| 2 | Data/Orario mai su righe separate | `whitespace-nowrap` su entrambi gli span |

---

## Confronto con Versione Precedente

```text
PRIMA (Piano 9.6):
- Badge: hover attivo (inutile per uno stato)
- Data/Orario: potevano wrappare su mobile stretto

DOPO (10/10):
- Badge: pointer-events-none (nessun hover)
- Data/Orario: whitespace-nowrap (sempre su una riga)
- Riga 1 senza flex-wrap (già garantito dai nowrap)
```

---

## Modifiche al File

**File**: `src/features/bookings/components/PendingRequestCard.tsx`

### Struttura Completa Target

```tsx
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
```

---

## Riepilogo Modifiche Complete

| Riga Originale | Modifica |
|----------------|----------|
| 46 | Card: rimuovere `overflow-hidden` |
| 47 | CardContent: `p-4` diventa `p-4 space-y-4` |
| 48-87 | Rimuovere grid 3 colonne, sostituire con BLOCCO INFO |
| 53 | Badge: `bg-primary/10 text-primary pointer-events-none` |
| 58-65 | Data/Orario separati con `whitespace-nowrap` su entrambi |
| 67-79 | Cliente e Meta su righe dedicate |
| 89-131 | BLOCCO AZIONI responsive con `flex-col sm:flex-row sm:flex-nowrap` |
| 91-103 | Bottoni con `w-full sm:w-auto` |
| 105-128 | Rifiuta come `Button variant="ghost"` con Popover |

---

## Checklist Finale

| Requisito | Stato |
|-----------|-------|
| Badge soft (non loud) | `bg-primary/10 text-primary` |
| Badge non interattivo | `pointer-events-none` |
| Orario prominente | `font-semibold text-foreground` |
| Data secondaria | `text-muted-foreground` |
| Mai wrap su riga 1 | `whitespace-nowrap` su tutti gli elementi |
| Mobile tap-friendly | `w-full` su bottoni |
| Desktop allineato | `sm:w-auto sm:justify-end sm:flex-nowrap` |
| Rifiuta coerente | `Button variant="ghost"` |
| Conferma rifiuto | Popover mantenuto |

