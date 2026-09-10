export const REGISTRATION_STATUSES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  /** Pagato al ritiro/QR (oggi) — non ancora presente alla corsa */
  PAID: "PAID",
  /** Presente a tutti gli effetti alla corsa */
  PAID_AND_CHECKED_IN: "PAID_AND_CHECKED_IN",
  CANCELLED: "CANCELLED",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING_PAYMENT: "Iscritto — da pagare",
  PAID: "Pagato",
  PAID_AND_CHECKED_IN: "Presente alla corsa",
  CANCELLED: "Annullato / non viene",
};

export function isPaidStatus(status: string): boolean {
  return (
    status === REGISTRATION_STATUSES.PAID ||
    status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN
  );
}

export function isRacePresentStatus(status: string): boolean {
  return status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
}

export const PARTICIPATION_STATUSES = {
  PENDING: "PENDING",
  YES: "YES",
  NO: "NO",
} as const;

export type ParticipationStatus =
  (typeof PARTICIPATION_STATUSES)[keyof typeof PARTICIPATION_STATUSES];

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  PENDING: "In attesa",
  YES: "Partecipa",
  NO: "Non partecipa",
};

export const PACE_CATEGORIES = [
  "Facile 6:00/km",
  "Medio 5:00/km",
  "Veloce 4:15/km",
] as const;

export type PaceCategory = (typeof PACE_CATEGORIES)[number];
