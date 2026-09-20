/**
 * ==============================
 * FILE: src/lib/templates.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Event templates: a title and a starter to-do list.
 *
 * Includes:
 * - EVENT_TEMPLATES, the list the add-event modal offers
 * - templateById
 *
 * Notes:
 * - For a group event the checklist goes into that group's to-dos.
 */

export type EventTemplate = {
  id: string;
  label: string;
  icon: string;
  title: string;
  todos: string[];
};

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'birthday',
    label: 'Birthday',
    icon: 'gift-outline',
    title: 'Birthday',
    todos: ['Pick a place', 'Cake', 'Gift', 'Send the invite'],
  },
  {
    id: 'trip',
    label: 'Trip',
    icon: 'airplane-outline',
    title: 'Trip',
    todos: ['Dates everyone can do', 'Book the stay', 'Book travel', 'Packing list', 'Split the costs'],
  },
  {
    id: 'holiday',
    label: 'Holiday dinner',
    icon: 'restaurant-outline',
    title: 'Holiday dinner',
    todos: ['Who is hosting', 'Menu', 'Who brings what', 'Playlist'],
  },
  {
    id: 'gamenight',
    label: 'Game night',
    icon: 'dice-outline',
    title: 'Game night',
    todos: ['Pick the games', 'Snacks', 'Whose place'],
  },
  {
    id: 'reunion',
    label: 'Reunion',
    icon: 'home-outline',
    title: 'Reunion',
    todos: ['Pick a weekend', 'Headcount', 'Venue', 'Photos and memories to bring'],
  },
  {
    id: 'movie',
    label: 'Movie night',
    icon: 'film-outline',
    title: 'Movie night',
    todos: ['Vote on the movie', 'Popcorn'],
  },
];

export function templateById(id: string): EventTemplate | null {
  return EVENT_TEMPLATES.find((template) => template.id === id) ?? null;
}
