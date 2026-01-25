

# Piano: PendingRequestCard — Layout Grid 3 Colonne

## Problema Attuale

Il layout `flex` attuale ha questi limiti:
- Badge e Data/Ora sulla stessa riga possono causare wrap non predicibili
- Bottoni con `size="sm"` ma senza larghezza controllata
- Troncamento "casuale" che può tagliare anche la data/ora

## Soluzione: Grid 3 Colonne

```text
┌────────────┬──────────────────────────────────┬─────────────────────────┐
│   STATO    │             INFO                 │        AZIONI           │
│   (auto)   │             (1fr)                │         (auto)          │
├────────────┼──────────────────────────────────┼─────────────────────────┤
│            │ lun 12 gen · 10:00–11:00         │  [Approva]              │
│ Da approv. │ 🔴 Matthew Count · 60 min        │  [Controproponi]        │
│            │ "Note opzionali..."              │  Rifiuta                │
└────────────┴──────────────────────────────────┴─────────────────────────┘
```

---

## Modifiche al File

**File**: `src/features/bookings/components/PendingRequestCard.tsx`

### Cambiamenti Strutturali

| Area | Prima | Dopo |
|------|-------|------|
| **Layout** | `flex items-start gap-4` | `grid grid-cols-[auto_1fr_auto] gap-4` |
| **Badge** | Inline con data/ora | Colonna dedicata `auto` |
| **Data/Ora** | Può wrappare | `whitespace-nowrap` (mai troncata) |
| **Nome** | `truncate` | `truncate` (mantenuto) |
| **Bottoni** | `size="sm"` | `h-9 px-3` esplicito per controllo larghezza |
| **Azioni** | Flex column | Flex column con bottoni stacked |

### Codice Target

```tsx
<Card className="overflow-hidden">
  <CardContent className="p-4">
    {/* 3 colonne: Stato | Info | Azioni */}
    <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">

      {/* COL 1: Stato (fissa, piccola) */}
      <div className="pt-0.5">
        <Badge className="bg-primary hover:bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
          Da approvare
        </Badge>
      </div>

      {/* COL 2: Info (elastica) */}
      <div className="flex flex-col space-y-1.5 min-w-0">
        {/* Riga 1: Data/ora mai troncata */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {formattedDateCompact} · {formattedTimeRange}
          </span>
        </div>

        {/* Riga 2: Nome troncabile + meta troncabile */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <ClientColorDot clientId={request.coach_client_id} />
            <span className="font-medium text-foreground truncate">
              {request.client_name}
            </span>
          </div>
          <span className="shrink-0">·</span>
          <span className="truncate">
            Lezione singola · {durationMinutes} min
          </span>
        </div>

        {/* Note opzionali */}
        {request.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">
            "{request.notes}"
          </p>
        )}
      </div>

      {/* COL 3: Azioni (fissa, allineata) */}
      <div className="flex flex-col items-end gap-1.5">
        <Button 
          className="h-9 px-3" 
          onClick={() => onApprove(request.id)} 
          disabled={isLoading}
        >
          <Check className="h-3.5 w-3.5 mr-1.5" />
          Approva
        </Button>
        <Button 
          variant="outline" 
          className="h-9 px-3" 
          onClick={() => onCounterPropose(request)} 
          disabled={isLoading}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
          Controproponi
        </Button>

        {/* Rifiuta con Popover */}
        <Popover open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
          <PopoverTrigger asChild>
            <button 
              disabled={isLoading} 
              className="text-xs text-destructive hover:underline disabled:opacity-50 mt-1"
            >
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

## Vantaggi del Layout Grid

| Aspetto | Flex (prima) | Grid (dopo) |
|---------|--------------|-------------|
| **Controllo colonne** | Implicito | Esplicito `auto_1fr_auto` |
| **Data/Ora** | Può wrappare | `whitespace-nowrap` garantito |
| **Badge** | Compete con info | Colonna dedicata stabile |
| **Bottoni** | Larghezza variabile | `h-9 px-3` consistente |
| **Rifiuta** | Sotto i bottoni | Stessa colonna, allineato |

---

## Regole di Troncamento

| Elemento | Comportamento |
|----------|---------------|
| **Data/Ora** | MAI troncata (`whitespace-nowrap`) |
| **Nome cliente** | Può troncare (`truncate`) |
| **Metadata** | Può troncare (`truncate`) |
| **Note** | `line-clamp-1` (una riga max) |
| **Badge** | MAI troncato (`whitespace-nowrap`) |

---

## Riepilogo Modifiche

| Riga | Modifica |
|------|----------|
| 48 | `flex items-start gap-4` → `grid grid-cols-[auto_1fr_auto] gap-4 items-start` |
| 51-61 | Badge in colonna separata |
| 54-61 | Data/ora con `whitespace-nowrap` |
| 64-73 | Nome e meta con troncamento controllato |
| 85-93 | Bottoni con `className="h-9 px-3"` invece di `size="sm"` |

---

## Risultato Atteso

- Badge sempre visibile in colonna dedicata
- Data/ora mai troncata
- Bottoni bilanciati e non dominanti
- Layout stabile che non "mangia" elementi
- Rifiuta posizionato correttamente sotto i bottoni

