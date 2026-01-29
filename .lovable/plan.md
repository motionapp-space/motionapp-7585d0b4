
# Piano di Correzione: Conteggio Serie Eventi

## Problema Identificato

Il sistema non mostra l'opzione "Elimina solo questo" vs "Elimina tutta la serie" perché la funzione `countFutureSeriesEvents` restituisce **0 eventi** invece di 6.

### Causa Tecnica

La query in `src/features/events/api/events.api.ts` (linea 267):

```typescript
.not('session_status', 'in', '("canceled","done")')
```

Questa sintassi **non gestisce correttamente i valori NULL**. Nel database, tutti i 6 eventi della serie hanno `session_status = NULL`, e in SQL il confronto con NULL usando `NOT IN` restituisce sempre FALSE.

**Query attuale (restituisce 0):**
```sql
WHERE session_status NOT IN ('canceled', 'done')
```

**Query corretta (restituisce 6):**
```sql
WHERE (session_status IS NULL OR session_status NOT IN ('canceled', 'done'))
```

## Soluzione

### File da Modificare
`src/features/events/api/events.api.ts`

### Modifica
Sostituire la riga 267:
```typescript
// PRIMA (non gestisce NULL)
.not('session_status', 'in', '("canceled","done")')

// DOPO (gestisce NULL correttamente)
.or('session_status.is.null,session_status.not.in.("canceled","done")')
```

## Impatto

Con questa correzione:
1. La query restituirà correttamente il numero di eventi futuri della serie
2. L'AlertDialog mostrerà le opzioni radio "Solo questo evento" / "Tutti i X appuntamenti futuri"
3. Il coach potrà scegliere se eliminare solo l'evento selezionato o l'intera serie

## Test Raccomandato

Dopo l'implementazione:
1. Aprire un evento che fa parte di una serie ricorrente
2. Cliccare "Elimina"
3. Verificare che appaiano le due opzioni radio
4. Verificare che il conteggio degli eventi futuri sia corretto
