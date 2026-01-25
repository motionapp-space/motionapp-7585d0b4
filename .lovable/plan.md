
# Piano Fix: Invalidazione Cache Onboarding in useCreateClient

## Bug Identificato

Il hook `useCreateClient.ts` non invalida la query `['onboarding-non-archived-count']` dopo la creazione di un cliente. Questo causa un ritardo di 30 secondi (staleTime della query) prima che `clientsCount` si aggiorni e i filtri diventino visibili.

### Comportamento Attuale

```text
Coach crea 2° cliente
        ↓
invalidateQueries(["clients"]) ✅
        ↓
["onboarding-non-archived-count"] resta in cache ❌
        ↓
clientsCount = 1 (stale)
        ↓
showFilters = false
        ↓
Filtri non visibili per 30 secondi
```

### Confronto Hook

| Hook | `["clients"]` | `["onboarding-non-archived-count"]` | `["onboarding-archived-check"]` |
|------|---------------|-------------------------------------|----------------------------------|
| `useCreateClient` | ✅ | ❌ MANCANTE | N/A |
| `useArchiveClient` | ✅ | ✅ | ✅ |
| `useUnarchiveClient` | ✅ | ✅ | ✅ |

---

## Soluzione

Aggiungere l'invalidazione delle query di onboarding in `useCreateClient.ts`.

### Modifica

**File**: `src/features/clients/hooks/useCreateClient.ts`

**Riga 49** (dopo `qc.invalidateQueries({ queryKey: ["clients"] });`):

```typescript
onSuccess: async (result: CreateClientResult) => {
  qc.setQueryData(
    ["client-activity", result.client.id],
    `Cliente creato: ${result.client.first_name} ${result.client.last_name}`
  );

  // Invalidate all client list queries
  qc.invalidateQueries({ queryKey: ["clients"] });
  
  // Invalidate onboarding queries to update clientsCount immediately
  qc.invalidateQueries({ queryKey: ["onboarding-non-archived-count"] });
  qc.invalidateQueries({ queryKey: ["onboarding-coach-clients"] });
  
  // Note: Navigation and success message are handled by the calling component
  // to allow showing InviteLinkDialog before navigation
},
```

---

## Riepilogo

| File | Modifica |
|------|----------|
| `src/features/clients/hooks/useCreateClient.ts` | Aggiungere invalidazione di `onboarding-non-archived-count` e `onboarding-coach-clients` |

---

## Risultato Atteso

- Quando il coach crea il 2° cliente, i filtri appaiono **immediatamente**
- Nessun ritardo di 30 secondi
- `clientsCount` si aggiorna in tempo reale
- Comportamento coerente con archive/unarchive
