/**
 * ==============================
 * FILE: src/context/CalendarContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Holds calendar events, RSVPs, the phone's busy blocks, and each group's
 * shared availability, so the calendar tab and the chat room read the same
 * data.
 *
 * Includes:
 * - Events, sorted by date then time
 * - Adding an event, with an optional reminder
 * - Deleting an event
 * - RSVPs on group events
 * - Busy times read from the phone's own calendars
 * - Each member's shared availability for "find a time"
 *
 * Notes:
 * - Firebase mode streams users/{uid}/events and each group's availability.
 * - Demo mode uses AsyncStorage.
 * - Busy times stay in memory and are never saved or synced.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as availabilityService from '../firebase/availabilityService';
import * as eventService from '../firebase/eventService';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import {
  BusyResult,
  readBusyBlocks,
} from '../lib/deviceCalendar';
import { scheduleEventReminder } from '../lib/notifications';
import {
  loadJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import {
  AvailabilitySlot,
  BusyBlock,
  CalendarEvent,
  MemberAvailability,
  RsvpStatus,
} from '../types';
import { useAuth } from './AuthContext';

type NewEvent = Omit<CalendarEvent, 'id' | 'rsvps'>;

type AvailabilityByGroup = Record<string, MemberAvailability[]>;

type CalendarCtx = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: NewEvent) => Promise<string>;
  deleteEvent: (id: string) => Promise<void>;
  rsvp: (eventId: string, status: RsvpStatus) => Promise<void>;
  busyBlocks: BusyBlock[];
  syncDeviceCalendar: (from: Date, to: Date) => Promise<BusyResult>;
  availabilityFor: (groupId: string) => MemberAvailability[];
  setMyAvailability: (groupId: string, slots: AvailabilitySlot[]) => Promise<void>;
};

const CalendarContext = createContext<CalendarCtx>({
  events: [],
  loading: true,
  error: null,
  addEvent: async () => '',
  deleteEvent: async () => {},
  rsvp: async () => {},
  busyBlocks: [],
  syncDeviceCalendar: async () => ({
    granted: false,
    blocks: [],
    calendars: 0,
  }),
  availabilityFor: () => [],
  setMyAvailability: async () => {},
});

function byDateThenTime(a: CalendarEvent, b: CalendarEvent): number {
  return `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`);
}

// fills in fields older saved events are missing
function withEventDefaults(event: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: event.id ?? '',
    groupId: event.groupId ?? null,
    title: event.title ?? '',
    date: event.date ?? '',
    time: event.time ?? null,
    reminder: event.reminder ?? false,
    color: event.color ?? null,
    rsvps: event.rsvps ?? {},
  };
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const uid = user?.uid ?? null;

  const [
    events,
    setEvents,
  ] = useState<CalendarEvent[]>([]);

  const [
    loadedFor,
    setLoadedFor,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    busyBlocks,
    setBusyBlocks,
  ] = useState<BusyBlock[]>([]);

  const [
    availability,
    setAvailability,
  ] = useState<AvailabilityByGroup>({});

  const availabilityUnsubs = useRef<Record<string, () => void>>({});

  useEffect(() => {
    if (!uid) {
      return undefined;
    }

    if (isFirebaseConfigured) {
      return eventService.subscribeToEvents(
        uid,
        (nextEvents) => {
          setEvents([...nextEvents].sort(byDateThenTime));
          setLoadedFor(uid);
        },
        (subscribeError) => {
          setError(subscribeError.message);
          setLoadedFor(uid);
        },
      );
    }

    Promise.all([
      loadJson<Partial<CalendarEvent>[]>(STORAGE_KEYS.events, []),
      loadJson<AvailabilityByGroup>(STORAGE_KEYS.availability, {}),
    ]).then(([savedEvents, savedAvailability]) => {
      setEvents(savedEvents.map(withEventDefaults).sort(byDateThenTime));
      setAvailability(savedAvailability);
      setLoadedFor(uid);
    });

    return undefined;
  }, [uid]);

  // drops the availability subscriptions when the account changes
  useEffect(() => {
    const unsubs = availabilityUnsubs.current;

    return () => {
      for (const groupId of Object.keys(unsubs)) {
        unsubs[groupId]();
        delete unsubs[groupId];
      }
    };
  }, [uid]);

  const saveEvents = useCallback(async (nextEvents: CalendarEvent[]) => {
    const sorted = [...nextEvents].sort(byDateThenTime);

    setEvents(sorted);
    await saveJson(STORAGE_KEYS.events, sorted);
  }, []);

  const addEvent = useCallback(
    async (event: NewEvent) => {
      if (!user) {
        return '';
      }

      // a failed reminder still saves the event
      if (event.reminder) {
        await scheduleEventReminder(event.title, event.date, event.time).catch(() => null);
      }

      const withRsvps = {
        ...event,
        rsvps: {},
      };

      if (isFirebaseConfigured) {
        return eventService.addEvent(user.uid, withRsvps);
      }

      const newEvent: CalendarEvent = {
        ...withRsvps,
        id: Date.now().toString(),
      };

      await saveEvents([
        ...events,
        newEvent,
      ]);

      return newEvent.id;
    },
    [
      user,
      events,
      saveEvents,
    ],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      if (isFirebaseConfigured) {
        await eventService.deleteEvent(user.uid, id);
        return;
      }

      await saveEvents(events.filter((event) => event.id !== id));
    },
    [
      user,
      events,
      saveEvents,
    ],
  );

  const rsvp = useCallback(
    async (eventId: string, status: RsvpStatus) => {
      const current = events.find((event) => event.id === eventId);

      if (!user || !current) {
        return;
      }

      const rsvps = {
        ...current.rsvps,
        [user.uid]: status,
      };

      if (isFirebaseConfigured) {
        await eventService.updateEvent(user.uid, eventId, { rsvps: rsvps });
        return;
      }

      await saveEvents(
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                rsvps: rsvps,
              }
            : event,
        ),
      );
    },
    [
      user,
      events,
      saveEvents,
    ],
  );

  const syncDeviceCalendar = useCallback(async (from: Date, to: Date) => {
    const result = await readBusyBlocks(from, to);

    if (result.granted) {
      setBusyBlocks(result.blocks);
    }

    return result;
  }, []);

  const subscribeIfNeeded = useCallback((groupId: string) => {
    if (!uid || !isFirebaseConfigured || availabilityUnsubs.current[groupId]) {
      return;
    }

    availabilityUnsubs.current[groupId] = availabilityService.subscribeToAvailability(
      groupId,
      (members) =>
        setAvailability((prev) => ({
          ...prev,
          [groupId]: members,
        })),
      () => {},
    );
  }, [uid]);

  const availabilityFor = useCallback(
    (groupId: string) => {
      subscribeIfNeeded(groupId);

      return availability[groupId] ?? [];
    },
    [
      availability,
      subscribeIfNeeded,
    ],
  );

  const setMyAvailability = useCallback(
    async (groupId: string, slots: AvailabilitySlot[]) => {
      if (!user) {
        return;
      }

      const username = user.username || 'me';

      if (isFirebaseConfigured) {
        await availabilityService.saveMyAvailability(groupId, user.uid, username, slots);
        return;
      }

      const mine: MemberAvailability = {
        uid: user.uid,
        username: username,
        slots: slots,
      };

      const next: AvailabilityByGroup = {
        ...availability,
        [groupId]: [
          ...(availability[groupId] ?? []).filter((member) => member.uid !== user.uid),
          mine,
        ],
      };

      setAvailability(next);
      await saveJson(STORAGE_KEYS.availability, next);
    },
    [
      user,
      availability,
    ],
  );

  const value = useMemo(
    () => ({
      events: user ? events : [],
      loading: user ? loadedFor !== user.uid : false,
      error: error,
      addEvent: addEvent,
      deleteEvent: deleteEvent,
      rsvp: rsvp,
      busyBlocks: busyBlocks,
      syncDeviceCalendar: syncDeviceCalendar,
      availabilityFor: availabilityFor,
      setMyAvailability: setMyAvailability,
    }),
    [
      user,
      events,
      loadedFor,
      error,
      addEvent,
      deleteEvent,
      rsvp,
      busyBlocks,
      syncDeviceCalendar,
      availabilityFor,
      setMyAvailability,
    ],
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  return useContext(CalendarContext);
}
