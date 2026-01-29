
# Piano di Correzione: Errore 404 su `cancel_series_with_ledger`

## Problema Identificato

La chiamata RPC a `cancel_series_with_ledger` restituisce **404 Not Found** perché esistono **due versioni** della funzione nel database con firme diverse:

| Versione | Parametri |
|----------|-----------|
| **Vecchia** | `(p_series_id, p_actor, p_now)` |
| **Nuova** | `(p_series_id, p_actor, p_now, p_only_future)` |

PostgREST non riesce a determinare quale funzione invocare quando viene passato il parametro `p_only_future`, causando un errore 404.

## Soluzione

Rimuovere la vecchia versione della funzione per eliminare l'ambiguità nell'overload.

### Migrazione SQL da eseguire

```sql
-- Drop della vecchia funzione (senza p_only_future)
DROP FUNCTION IF EXISTS public.cancel_series_with_ledger(uuid, text, timestamp with time zone);
```

Questo lascerà solo la versione nuova con `p_only_future`, che è quella effettivamente utilizzata dal codice frontend.

## Verifica Post-Migrazione

1. Creare una serie di appuntamenti ricorrenti
2. Aprire un evento della serie e cliccare "Elimina"
3. Verificare che appaia il dialog con le due opzioni (solo questo / tutta la serie)
4. Selezionare "Tutta la serie" e confermare
5. Verificare che tutti gli eventi futuri vengano cancellati

## Note Tecniche

- Il codice in `useDeleteSeries.ts` chiama già correttamente la funzione con tutti e 4 i parametri
- La funzione nuova ha `p_only_future DEFAULT true` quindi funziona anche se non viene passato esplicitamente
- Non sono necessarie modifiche al codice frontend
