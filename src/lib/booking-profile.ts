import type { AthleteProfile } from "@/app/actions/athlete-profile";

export function isBookingProfileComplete(profile: AthleteProfile | null | undefined) {
  if (!profile) return false;
  return Boolean(
    profile.firstName.trim().length >= 2 &&
      profile.lastName.trim().length >= 2 &&
      profile.phone.trim().length >= 8 &&
      profile.paceCategory,
  );
}
