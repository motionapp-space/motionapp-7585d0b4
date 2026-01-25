
# Piano Fix: Visibilità Clienti "Invited" per Coach

## Diagnosi Completa

### Root Cause Identificate

Il coach non vede i clienti appena creati perché:

1. **Frontend**: Tre hook/store filtrano solo `status = 'active'`, causando `clientsCount = 0` e l'empty state
2. **Database RLS**: Tre tabelle hanno policy INSERT che richiedono `status = 'active'`, bloccando operazioni su clienti `invited`

### Flusso Buggy Attuale

```text
Coach crea cliente con invito
        ↓
coach_clients.status = 'invited'
        ↓
useOnboardingState() filtra solo 'active' → clientsCount = 0
        ↓
Stato = ZERO_CLIENTS → mostra empty state "Benvenuto"
        ↓
❌ Cliente invisibile, lista mai renderizzata
```

---

## Audit Completo

### RLS Policies - Stato Attuale

| Tabella | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| `coach_clients` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |
| `clients` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |
| `client_activities` | ✅ OK | ❌ **Richiede active** | N/A | N/A |
| `client_tag_on_client` | ✅ OK | ❌ **Richiede active** | N/A | ✅ OK |
| `measurements` | ✅ OK | ❌ **Richiede active** | ✅ OK | ✅ OK |
| `events` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |
| `package` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |
| `client_plans` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |
| `training_sessions` | ✅ OK | ✅ OK | ✅ OK | ✅ OK |

**Nota**: `events`, `package`, `client_plans`, `training_sessions` già funzionano per `invited` (usano `coach_client_id` senza filtro status).

### Frontend - Punti da Correggere

| File | Linea | Problema |
|------|-------|----------|
| `useOnboardingState.ts` | 44 | `.eq('status', 'active')` |
| `useDashboardStats.ts` | 31 | `.eq("status", "active")` |
| `useClientStore.ts` | 70 | `.eq("status", "active")` |

### Frontend - Già OK (Nessuna Modifica)

| File | Note |
|------|------|
| `clients.api.ts:42` | Usa già `.in("status", ["active", "invited"])` |
| `clients.api.ts:264-269` | `getClientById` non filtra per status |
| `coach-client.ts:11-16` | `getCoachClientId` non filtra per status |
| `client-bookings.api.ts:40` | Lato CLIENT - corretto richiedere `active` |
| `coach-client.ts:123` | `getClientCoachClientId` è lato CLIENT - corretto |

---

## Soluzione

### Parte 1: Costante Centralizzata (Prevenzione Futura)

Creare un file di costanti per evitare hardcoding futuro.

**Nuovo file**: `src/lib/constants/coach-client-statuses.ts`

```typescript
/**
 * Status visibili lato coach per la gestione clienti.
 * Include 'invited' per permettere la gestione di clienti
 * che non hanno ancora accettato l'invito.
 */
export const COACH_MANAGEABLE_STATUSES = ['active', 'invited'] as const;

export type CoachManageableStatus = typeof COACH_MANAGEABLE_STATUSES[number];
```

### Parte 2: Fix Frontend

**File 1**: `src/features/clients/hooks/useOnboardingState.ts` (riga 44)

```typescript
// PRIMA
.eq('status', 'active')

// DOPO  
.in('status', COACH_MANAGEABLE_STATUSES)
```

**File 2**: `src/features/dashboard/hooks/useDashboardStats.ts` (riga 31)

```typescript
// PRIMA
.eq("status", "active")

// DOPO
.in("status", COACH_MANAGEABLE_STATUSES)
```

**File 3**: `src/stores/useClientStore.ts` (riga 70)

```typescript
// PRIMA
.eq("status", "active")

// DOPO
.in("status", COACH_MANAGEABLE_STATUSES)
```

### Parte 3: Fix RLS Database

Aggiornare le policy INSERT per includere `invited`:

```sql
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
```

---

## Riepilogo Modifiche

| Tipo | Risorsa | Azione |
|------|---------|--------|
| Nuovo file | `src/lib/constants/coach-client-statuses.ts` | Creare costante centralizzata |
| Fix FE | `useOnboardingState.ts:44` | Usare `COACH_MANAGEABLE_STATUSES` |
| Fix FE | `useDashboardStats.ts:31` | Usare `COACH_MANAGEABLE_STATUSES` |
| Fix FE | `useClientStore.ts:70` | Usare `COACH_MANAGEABLE_STATUSES` |
| Fix DB | `client_activities` RLS INSERT | Aggiungere `'invited'` |
| Fix DB | `client_tag_on_client` RLS INSERT | Aggiungere `'invited'` |
| Fix DB | `measurements` RLS INSERT | Aggiungere `'invited'` |

---

## Risultato Atteso

Dopo l'implementazione:
- ✅ Clienti `invited` visibili nella lista
- ✅ Conteggio clienti corretto (non più 0)
- ✅ Dashboard stats includono clienti invited
- ✅ Navigazione al dettaglio cliente funzionante
- ✅ Coach può creare attività, tag, misurazioni per clienti invited
- ✅ Coach può già creare eventi, pacchetti, piani, sessioni (RLS già OK)

---

## Note Tecniche

### Perché NON Modificare `coach-client.ts:123`

La funzione `getClientCoachClientId()` è usata **lato CLIENT** (dall'app cliente) per trovare la propria relazione con il coach. È corretto che richieda `status = 'active'` perché:
- Un cliente `invited` non ha ancora accettato l'invito
- Non dovrebbe poter accedere all'app cliente finché non completa la registrazione
- Quando accetta l'invito, lo status diventa `active`

### Perché NON Modificare `client-bookings.api.ts:40`

Stesso ragionamento: è codice lato CLIENT che verifica la relazione del cliente con il suo coach.
