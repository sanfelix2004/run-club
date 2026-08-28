import type { PublicEvent } from "@/app/actions/events";

export const PENDING_EVENT_STORAGE_KEY = "rcg-pending-event";

export function savePendingEvent(event: PublicEvent) {
  sessionStorage.setItem(PENDING_EVENT_STORAGE_KEY, JSON.stringify(event));
}

export function consumePendingEvent(): PublicEvent | null {
  const raw = sessionStorage.getItem(PENDING_EVENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const event = JSON.parse(raw) as PublicEvent;
    sessionStorage.removeItem(PENDING_EVENT_STORAGE_KEY);
    return event;
  } catch {
    sessionStorage.removeItem(PENDING_EVENT_STORAGE_KEY);
    return null;
  }
}
