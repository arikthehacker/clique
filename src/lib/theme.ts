/**
 * ==============================
 * FILE: src/lib/theme.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Simple mode: bigger text for people who want less on screen.
 *
 * Includes:
 * - scaled, a font size adjusted for simple mode
 *
 * Notes:
 * - Screens pass in user.simpleMode. Only sizes change, not colors.
 */

const SIMPLE_SCALE = 1.3;

export function scaled(size: number, simpleMode: boolean): number {
  return Math.round(size * (simpleMode ? SIMPLE_SCALE : 1));
}
