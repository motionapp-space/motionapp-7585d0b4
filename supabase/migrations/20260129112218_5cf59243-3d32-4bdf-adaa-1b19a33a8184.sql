-- Drop della vecchia funzione (senza p_only_future) per eliminare l'ambiguità nell'overload
DROP FUNCTION IF EXISTS public.cancel_series_with_ledger(uuid, text, timestamp with time zone);