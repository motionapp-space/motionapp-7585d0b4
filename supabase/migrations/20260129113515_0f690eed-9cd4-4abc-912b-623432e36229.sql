-- Drop della vecchia funzione cancel_event_with_ledger (senza p_client_user_id)
-- Risolve il problema di overloading che causa errori 400 Bad Request
DROP FUNCTION IF EXISTS public.cancel_event_with_ledger(uuid, text, timestamp with time zone);