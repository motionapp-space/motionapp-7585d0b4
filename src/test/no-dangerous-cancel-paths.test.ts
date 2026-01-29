import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function readFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(relativePath), "utf-8");
}

describe("No dangerous cancel paths (anti-regression)", () => {
  it("client-bookings.api should not update session_status=canceled directly", () => {
    const file = readFile("src/features/client-bookings/api/client-bookings.api.ts");
    
    // Should NOT contain direct session_status update
    expect(file).not.toContain("session_status: 'canceled'");
    expect(file).not.toContain('session_status: "canceled"');
  });

  it("client-bookings.api should delegate to client-appointment-actions edge function", () => {
    const file = readFile("src/features/client-bookings/api/client-bookings.api.ts");
    
    // Should call edge function for actions, not direct RPC
    expect(file).toContain("client-appointment-actions");
    expect(file).toContain("supabase.functions.invoke");
    
    // Should NOT contain direct cancel_event_with_ledger RPC call
    // (delegated to edge function for proper snapshot handling)
    expect(file).not.toContain("supabase.rpc('cancel_event_with_ledger");
  });

  it("EventEditorModal should not use useDeleteEvent hook", () => {
    const file = readFile("src/features/events/components/EventEditorModal.tsx");
    
    // Should NOT import or use useDeleteEvent
    expect(file).not.toContain("useDeleteEvent");
    expect(file).not.toContain("deleteEvent.mutate");
    expect(file).not.toContain("deleteEvent.mutateAsync");
  });

  it("EventEditorModal should use cancel_event_with_ledger RPC", () => {
    const file = readFile("src/features/events/components/EventEditorModal.tsx");
    
    // Should contain RPC call for cancel
    expect(file).toContain("cancel_event_with_ledger");
    expect(file).toContain("p_actor: 'coach'");
  });

  it("Calendar.tsx should not use useDeleteEvent hook", () => {
    const file = readFile("src/pages/Calendar.tsx");
    
    // Should NOT import or use useDeleteEvent
    expect(file).not.toContain("useDeleteEvent");
    expect(file).not.toContain("deleteEvent.mutate");
    expect(file).not.toContain("deleteEvent.mutateAsync");
  });

  it("Calendar.tsx should use useCancelEvent hook", () => {
    const file = readFile("src/pages/Calendar.tsx");
    
    // Should import useCancelEvent
    expect(file).toContain("useCancelEvent");
    expect(file).toContain("cancelEvent.mutateAsync");
  });

  it("useCancelEvent hook should use cancel_event_with_ledger RPC, not deleteEvent", () => {
    const file = readFile("src/features/events/hooks/useCancelEvent.ts");
    
    // Should contain RPC call
    expect(file).toContain("cancel_event_with_ledger");
    expect(file).toContain("p_actor:");
    expect(file).toContain("p_event_id:");
    
    // Should NOT call physical delete
    expect(file).not.toContain("await deleteEvent(");
  });

  it("cancelAppointment function should use edge function", () => {
    const file = readFile("src/features/client-bookings/api/client-bookings.api.ts");
    
    // Find the cancelAppointment function and verify it uses edge function
    const cancelFnMatch = file.match(/export async function cancelAppointment[\s\S]*?^}/m);
    
    if (cancelFnMatch) {
      const cancelFn = cancelFnMatch[0];
      expect(cancelFn).toContain("supabase.functions.invoke");
      expect(cancelFn).toContain("client-appointment-actions");
      expect(cancelFn).toContain("cancel_appointment");
      // Should NOT contain direct RPC call (delegated to edge function)
      expect(cancelFn).not.toContain("supabase.rpc");
    }
  });

  it("rejectChangeProposal uses edge function", () => {
    const file = readFile("src/features/client-bookings/api/client-bookings.api.ts");
    
    // Find the rejectChangeProposal function
    const rejectFnMatch = file.match(/export async function rejectChangeProposal[\s\S]*?^}/m);
    
    if (rejectFnMatch) {
      const rejectFn = rejectFnMatch[0];
      expect(rejectFn).toContain("supabase.functions.invoke");
      expect(rejectFn).toContain("client-appointment-actions");
      expect(rejectFn).toContain("reject_change_proposal");
      // Should NOT contain direct RPC call
      expect(rejectFn).not.toContain("supabase.rpc");
    }
  });
});
