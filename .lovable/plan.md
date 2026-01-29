
# Piano di Correzione: "FOR UPDATE is not allowed with aggregate functions"

## Problema Identificato

La funzione `cancel_series_with_ledger` contiene una query che combina:
- `array_agg(id ORDER BY start_at)` - funzione aggregata
- `FOR UPDATE` - lock per update

PostgreSQL non permette questa combinazione perché il lock `FOR UPDATE` richiede righe individuali, mentre le funzioni aggregate restituiscono un singolo risultato.

## Soluzione

Separare la query in due step:
1. Prima fare il lock sulle righe con `FOR UPDATE` senza aggregazione
2. Poi aggregare gli ID già selezionati

### Migrazione SQL

```sql
CREATE OR REPLACE FUNCTION public.cancel_series_with_ledger(
  p_series_id uuid,
  p_actor text,
  p_now timestamptz DEFAULT now(),
  p_only_future boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_event_id uuid;
  v_event_ids uuid[];
  v_results jsonb[] := '{}';
  v_result jsonb;
  v_count int := 0;
  v_errors int := 0;
  v_coach_client_id uuid;
BEGIN
  -- Prima ottieni coach_client_id
  SELECT coach_client_id INTO v_coach_client_id
  FROM events 
  WHERE series_id = p_series_id 
  LIMIT 1;

  -- Lock le righe PRIMA, poi aggrega gli ID
  -- Step 1: Lock le righe interessate
  PERFORM id FROM events 
  WHERE series_id = p_series_id 
    AND (session_status IS NULL OR session_status NOT IN ('canceled', 'done'))
    AND (NOT p_only_future OR start_at >= p_now)
  FOR UPDATE;
  
  -- Step 2: Ora aggrega gli ID (senza FOR UPDATE)
  SELECT array_agg(id ORDER BY start_at)
  INTO v_event_ids
  FROM events 
  WHERE series_id = p_series_id 
    AND (session_status IS NULL OR session_status NOT IN ('canceled', 'done'))
    AND (NOT p_only_future OR start_at >= p_now);
  
  IF v_event_ids IS NULL OR array_length(v_event_ids, 1) = 0 THEN
    RETURN jsonb_build_object(
      'series_id', p_series_id, 
      'canceled_count', 0, 
      'message', 'No cancellable events in series'
    );
  END IF;

  -- Auth check
  IF p_actor = 'coach' THEN
    PERFORM check_coach_owns_coach_client(v_coach_client_id);
  ELSIF p_actor = 'client' THEN
    PERFORM check_client_owns_coach_client(v_coach_client_id);
  ELSE
    RAISE EXCEPTION 'Invalid actor';
  END IF;

  -- Itera e cancella ogni evento
  FOREACH v_event_id IN ARRAY v_event_ids
  LOOP
    BEGIN
      v_result := cancel_event_with_ledger(v_event_id, p_actor, p_now);
      v_results := array_append(v_results, v_result);
      IF (v_result->>'canceled')::boolean IS TRUE OR (v_result->>'already_canceled')::boolean IS TRUE THEN
        v_count := v_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      v_results := array_append(v_results, jsonb_build_object(
        'event_id', v_event_id,
        'error', SQLERRM
      ));
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'series_id', p_series_id,
    'canceled_count', v_count,
    'errors_count', v_errors,
    'total_events', array_length(v_event_ids, 1),
    'results', to_jsonb(v_results)
  );
END;
$$;
```

## Cosa cambia

| Prima | Dopo |
|-------|------|
| Una query con `array_agg() + FOR UPDATE` | Due query separate |
| Errore PostgreSQL | Lock corretto sulle righe |

## Verifica Post-Migrazione

1. Aprire un evento ricorrente
2. Cliccare "Elimina" e selezionare "Tutta la serie"
3. Confermare e verificare che tutti gli eventi futuri vengano cancellati
