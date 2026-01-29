# Memory: architecture/calendar-event-deletion-unified-rpc
Updated: 2026-01-29

Single event deletions in `Calendar.tsx` now use `useCancelEvent` hook which calls the `cancel_event_with_ledger` RPC (soft delete with ledger management), aligning with series deletions that use `cancel_series_with_ledger`. This replaces the previous `useDeleteEvent` hook which performed physical DELETE operations, ensuring:
- Consistent soft-delete behavior (session_status='canceled')
- Proper ledger management (HOLD_RELEASE or CONSUME based on lock window)
- Audit trail preservation
- Email notifications via snapshot pattern

The `useDeleteEvent` hook is now deprecated and should not be used for coach-side cancellations. Anti-regression tests in `no-dangerous-cancel-paths.test.ts` verify that `Calendar.tsx` uses `useCancelEvent` instead of `useDeleteEvent`.
