
# Analisi Funzionalità Gestione Serie Ricorrenti

## Criticità Identificate

### 1. CRITICA: Incoerenza tra Delete Singolo e Delete Serie

| Operazione | Metodo | Impatto |
|------------|--------|---------|
| **Elimina singolo** | `deleteEvent()` → DELETE fisica | Rimuove record dal DB |
| **Elimina serie** | `cancel_series_with_ledger` RPC → Soft delete | Imposta `session_status='canceled'` |

**Problema**: Quando si elimina un singolo evento di una serie, viene eseguita una DELETE fisica tramite `useDeleteEvent`, mentre la cancellazione dell'intera serie usa `cancel_series_with_ledger` che fa soft-delete. Questo crea incoerenza nei dati e può causare:
- Conteggio errato degli eventi futuri della serie (`countFutureSeriesEvents`)
- Perdita di audit trail per eventi singoli
- Nessuna gestione del ledger per singoli eventi eliminati

### 2. Test Anti-Regression Incompleto

Il test `no-dangerous-cancel-paths.test.ts` verifica che `EventEditorModal` non usi `useDeleteEvent`, ma:
- `Calendar.tsx` importa e usa `useDeleteEvent` per eliminazioni singole (linea 70)
- Questo bypassa la logica ledger e soft-delete

### 3. Gestione Economica Mancante per Delete Singolo

`useDeleteEvent` esegue:
1. Costruisce snapshot per email
2. DELETE fisica
3. Log attività
4. Queue email

**NON** esegue:
- Rilascio crediti pacchetto (HOLD_RELEASE)
- Aggiornamento order_payment
- Rispetto della finestra di cancellazione

### 4. Casi Edge Non Coperti

| Caso | Stato |
|------|-------|
| Serie con mix di eventi cancellati/attivi | OK - filtrati correttamente |
| Serie con eventi passati + futuri | OK - `p_only_future=true` |
| Eliminazione ultimo evento della serie | Non testato - potrebbe lasciare serie "orfana" |
| Serie creata senza lessonType (free) | Funziona ma senza gestione economica |

## Soluzione Proposta

### Fase 1: Unificare Delete Singolo con RPC

Modificare `Calendar.tsx` per usare `cancel_event_with_ledger` anche per eliminazioni singole:

```typescript
// Invece di:
await deleteEvent.mutateAsync(deleteConfirmation.eventId);

// Usare:
await supabase.rpc('cancel_event_with_ledger', {
  p_event_id: deleteConfirmation.eventId,
  p_actor: 'coach',
  p_now: new Date().toISOString()
});
```

### Fase 2: Aggiornare Test Anti-Regression

Aggiungere test che verifica che `Calendar.tsx` NON usi `deleteEvent` direttamente.

### Fase 3: Deprecare useDeleteEvent

Rimuovere o marcare come deprecated `useDeleteEvent` per prevenire uso futuro.

## Note Tecniche

- Le migrazioni SQL eseguite hanno risolto l'errore 400 e l'errore `FOR UPDATE with aggregate`
- La funzione `cancel_series_with_ledger` ora funziona correttamente
- Il conteggio eventi futuri (`countFutureSeriesEvents`) gestisce correttamente NULL status
