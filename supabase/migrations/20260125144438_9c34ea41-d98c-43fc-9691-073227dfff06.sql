-- Fix RLS INSERT policies per permettere operazioni su clienti 'invited'

-- 1. client_activities INSERT
DROP POLICY IF EXISTS "Coaches can create activities for their clients" 
  ON public.client_activities;
  
CREATE POLICY "Coaches can create activities for their clients"
ON public.client_activities FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT cc.client_id FROM coach_clients cc
    WHERE cc.coach_id = auth.uid() 
    AND cc.status IN ('active', 'invited')
  )
);

-- 2. client_tag_on_client INSERT
DROP POLICY IF EXISTS "Coaches can add tags to their clients" 
  ON public.client_tag_on_client;
  
CREATE POLICY "Coaches can add tags to their clients"
ON public.client_tag_on_client FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT cc.client_id FROM coach_clients cc
    WHERE cc.coach_id = auth.uid() 
    AND cc.status IN ('active', 'invited')
  )
);

-- 3. measurements INSERT
DROP POLICY IF EXISTS "Coaches can create measurements for their clients" 
  ON public.measurements;
  
CREATE POLICY "Coaches can create measurements for their clients"
ON public.measurements FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT cc.client_id FROM coach_clients cc
    WHERE cc.coach_id = auth.uid() 
    AND cc.status IN ('active', 'invited')
  )
);