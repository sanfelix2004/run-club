export const REGISTRATION_STATUSES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID_AND_CHECKED_IN: "PAID_AND_CHECKED_IN",
  CANCELLED: "CANCELLED",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];

export const PACE_CATEGORIES = [
  "Easy 6:00/km",
  "Tempo 5:00/km",
  "Fast 4:15/km",
] as const;

export type PaceCategory = (typeof PACE_CATEGORIES)[number];
