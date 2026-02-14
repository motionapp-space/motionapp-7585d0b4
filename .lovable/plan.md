

## Allineare le tab di autenticazione allo stile delle tab della piattaforma

Attualmente le tab "Accedi / Registrati" nella pagina di login usano uno stile diverso rispetto alle tab usate nella piattaforma coach (es. nella Libreria). Il piano e' di uniformarle.

### Differenze attuali

| Proprieta' | Tab Auth (attuale) | Tab Piattaforma (target) |
|---|---|---|
| Sfondo selezionato | `bg-card` (bianco) + `shadow-sm` | `bg-[hsl(var(--accent-soft-6))]` (tinta Ice) |
| Bordo selezionato | Nessuno | `border border-[hsl(var(--selection-border))]` |
| Hover | Nessuno | `bg-[hsl(var(--accent-soft-2))]` |
| Sfondo container | `bg-[hsl(220,15%,92%)]` | `bg-muted/60` |

### Modifiche

**File: `src/pages/Auth.tsx`** (linee 138-161)

1. Cambiare lo sfondo del container da `bg-[hsl(220,15%,92%)]` a `bg-muted/60`
2. Aggiornare lo stato attivo dei bottoni:
   - Da: `bg-card text-foreground shadow-sm`
   - A: `bg-[hsl(var(--accent-soft-6))] text-foreground font-medium border border-[hsl(var(--selection-border))]` (senza shadow)
3. Aggiungere hover state: `hover:bg-[hsl(var(--accent-soft-2))]` sui bottoni inattivi
4. Mantenere `rounded-full` e il padding esistenti

Questo rendera' le tab di autenticazione visivamente identiche a quelle usate nel resto della piattaforma.
