

# Piano di Correzione: Errore 400 Bad Request su `cancel_series_with_ledger`

## Problema Identificato

La funzione `cancel_event_with_ledger` ha **due versioni** nel database (overloading):

| Versione | Parametri | OID |
|----------|-----------|-----|
| **Vecchia** | `(p_event_id, p_actor, p_now)` | 99993 |
| **Nuova** | `(p_event_id, p_actor, p_now, p_client_user_id)` | 115783 |

Quando `cancel_series_with_ledger` chiama internamente `cancel_event_with_ledger(v_event_id, p_actor, p_now)`, PostgreSQL potrebbe avere difficolta a risolvere quale versione usare, causando comportamenti imprevedibili o errori.

Inoltre, come indicato nella memoria del progetto (`supabase-rpc-overloading-restriction`), l'overloading delle funzioni RPC e vietato per garantire la corretta risoluzione delle chiamate PostgREST.

## Soluzione

Rimuovere la versione vecchia di `cancel_event_with_ledger` (quella senza `p_client_user_id`), lasciando solo la versione completa che ha `p_client_user_id DEFAULT NULL`.

### Migrazione SQL da eseguire

```sql
-- Drop della vecchia funzione (senza p_client_user_id)
DROP FUNCTION IF EXISTS public.cancel_event_with_ledger(uuid, text, timestamp with time zone);
```

La versione rimanente:
- `cancel_event_with_ledger(uuid, text, timestamptz, uuid DEFAULT NULL)` 

Funzionera correttamente sia quando chiamata con 3 parametri (dalla funzione di serie) che con 4 (dalle Edge Functions con autenticazione service role).

## Verifica Post-Migrazione

1. Creare una serie di appuntamenti ricorrenti
2. Aprire un evento della serie e cliccare "Elimina"
3. Selezionare "Tutta la serie" e confermare
4. Verificare che tutti gli eventi futuri vengano cancellati senza errori

## Note Tecniche

- La versione con `p_client_user_id DEFAULT NULL` copre tutti i casi d'uso
- Le chiamate interne dalla funzione `cancel_series_with_ledger` continueranno a funzionare
- Le chiamate dalle Edge Functions con `p_client_user_id` esplicito continueranno a funzionare

