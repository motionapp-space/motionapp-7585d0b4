import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logClientActivity } from "@/features/clients/api/activities.api";
import { getCoachClientDetails } from "@/lib/coach-client";
import { getEventById } from "../api/events.api";
import { buildEventSnapshot, queueBookingEmailWithSnapshot } from "@/lib/email-snapshot";

interface CancelEventInput {
  eventId: string;
  isCoachCancelling?: boolean;
}

interface CancelEventResult {
  event_id: string;
  canceled: boolean;
  already_canceled?: boolean;
  economic_type: string;
  is_late: boolean;
  ledger_action: string;
  order_status?: string;
}

/**
 * Hook per cancellare un singolo evento tramite RPC cancel_event_with_ledger.
 * Garantisce coerenza con la cancellazione di serie (soft delete + gestione ledger).
 */
export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isCoachCancelling = true }: CancelEventInput) => {
      // 1. Get event details BEFORE cancellation for email snapshot
      const event = await getEventById(eventId);
      
      // 2. Build email snapshot BEFORE cancellation
      let snapshot;
      try {
        snapshot = await buildEventSnapshot(event, 'coach');
      } catch (e) {
        console.warn("Could not build event snapshot for email:", e);
      }
      
      // 3. Call RPC for soft-delete with ledger management
      const now = new Date().toISOString();
      const actor = isCoachCancelling ? 'coach' : 'client';
      
      const { data, error } = await supabase.rpc('cancel_event_with_ledger', {
        p_event_id: eventId,
        p_actor: actor,
        p_now: now,
      });
      
      if (error) throw error;
      
      const result = data as unknown as CancelEventResult;
      
      // 4. Return event info for onSuccess
      return { 
        event, 
        result, 
        snapshot,
        isCoachCancelling 
      };
    },
    onSuccess: async ({ event, result, snapshot, isCoachCancelling }) => {
      // Get client_id for activity log
      try {
        const { client_id: clientId } = await getCoachClientDetails(event.coach_client_id);
        
        if (clientId) {
          await logClientActivity(
            clientId,
            "EVENT_DELETED",
            `Appuntamento cancellato: ${event.title || "Sessione"}`
          );
        }
      } catch (error) {
        console.warn("Could not log client activity:", error);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["events"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["packages"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["package-ledger"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["series-count"], exact: false });

      // Show appropriate toast based on result
      if (result.already_canceled) {
        toast.info("Evento già cancellato");
        return;
      }

      if (result.ledger_action === 'consume') {
        toast.warning("Cancellazione tardiva", {
          description: "1 credito consumato per cancellazione entro lock window"
        });
      } else if (result.ledger_action === 'release') {
        toast.success("Appuntamento cancellato", {
          description: "Credito restituito al cliente"
        });
      } else {
        toast.success("Appuntamento cancellato");
      }

      // Queue email notification to client
      if (snapshot && isCoachCancelling) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await queueBookingEmailWithSnapshot({
              type: 'appointment_cancelled',
              actorUserId: user.id,
              snapshot,
            });
          }
        } catch (e) {
          console.warn('Failed to queue cancellation email:', e);
        }
      }
    },
    onError: (error: Error) => {
      toast.error("Errore", {
        description: error.message || "Impossibile cancellare l'appuntamento"
      });
    },
  });
}
