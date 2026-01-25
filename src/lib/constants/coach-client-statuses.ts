/**
 * Status visibili lato coach per la gestione clienti.
 * Include 'invited' per permettere la gestione di clienti
 * che non hanno ancora accettato l'invito.
 */
export const COACH_MANAGEABLE_STATUSES = ['active', 'invited'] as const;

export type CoachManageableStatus = typeof COACH_MANAGEABLE_STATUSES[number];
