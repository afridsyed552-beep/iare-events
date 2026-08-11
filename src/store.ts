import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, RsvpStatus, Toast } from "./types";
import { events as seedEvents } from "./data";
import type { EventItem } from "./types";

interface AppState {
  user: AppUser | null;
  rsvps: Record<string, RsvpStatus>;
  joinedClubs: string[];
  customEvents: EventItem[];
  toasts: Toast[];

  // auth
  login: (user: AppUser) => void;
  logout: () => void;

  // rsvp
  setRsvp: (eventId: string, status: Exclude<RsvpStatus, null>) => void;
  clearRsvp: (eventId: string) => void;

  // clubs
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;

  // events
  addEvent: (event: EventItem) => void;

  // toasts
  toast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      rsvps: {},
      joinedClubs: [],
      customEvents: [],
      toasts: [],

      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      setRsvp: (eventId, status) =>
        set((s) => ({ rsvps: { ...s.rsvps, [eventId]: status } })),
      clearRsvp: (eventId) => {
        const next = { ...get().rsvps };
        delete next[eventId];
        set({ rsvps: next });
      },

      joinClub: (clubId) =>
        set((s) =>
          s.joinedClubs.includes(clubId)
            ? s
            : { joinedClubs: [...s.joinedClubs, clubId] }
        ),
      leaveClub: (clubId) =>
        set((s) => ({ joinedClubs: s.joinedClubs.filter((c) => c !== clubId) })),

      addEvent: (event) => set((s) => ({ customEvents: [event, ...s.customEvents] })),

      toast: (message, type = "success") => {
        const id = `toast-${++toastSeq}`;
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().dismissToast(id), 4200);
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "iare-events-store",
      partialize: (s) => ({
        user: s.user,
        rsvps: s.rsvps,
        joinedClubs: s.joinedClubs,
        customEvents: s.customEvents,
      }),
    }
  )
);

// All events = seeded + user-created (custom events are prepended)
export function allEvents(): EventItem[] {
  return [...useStore.getState().customEvents, ...seedEvents];
}

export function useAllEvents(): EventItem[] {
  const custom = useStore((s) => s.customEvents);
  return [...custom, ...seedEvents];
}

export function findEvent(id: string): EventItem | undefined {
  return allEvents().find((e) => e.id === id);
}
