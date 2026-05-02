
// CalendarContext.tsx
import React, { createContext, useState, useContext } from 'react';

export interface Event {
  id: string;
  groupId: string;
  title: string;
  date: string;      // YYYY-MM-DD
  time?: string;     // HH:mm
  color?: string;    // group color
}

const CalendarContext = createContext<{
  events: Event[];
  addEvent: (e: Event) => void;
}>({ events: [], addEvent: () => {} });

export const CalendarProvider: React.FC = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const addEvent = (e: Event) => setEvents((prev) => [...prev, e]);
  return (
    <CalendarContext.Provider value={{ events, addEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
