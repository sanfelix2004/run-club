export const REGISTRATION_STATUSES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID_AND_CHECKED_IN: "PAID_AND_CHECKED_IN",
  CANCELLED: "CANCELLED",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];

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
