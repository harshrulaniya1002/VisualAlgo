/** Available playback speed multipliers. */
export const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4];

/** Default playback speed multiplier. */
export const DEFAULT_SPEED = 1;

/** Base delay in milliseconds between steps at 1x speed. */
export const BASE_DELAY = 500;

/**
 * Shared color palette used across renderers and UI components.
 *
 * Naming follows Tailwind-inspired conventions so colors stay consistent
 * with the project's utility-first CSS approach.
 */
export const COLORS = {
  // Bar / array states
  default: '#94a3b8',       // slate-400
  comparing: '#facc15',     // yellow-400
  swapping: '#ef4444',      // red-500
  sorted: '#22c55e',        // green-500
  found: '#22c55e',         // green-500
  notFound: '#ef4444',      // red-500
  eliminate: '#cbd5e1',     // slate-300  (dimmed / eliminated region)

  // Pointer / marker colors
  pointerLow: '#3b82f6',    // blue-500
  pointerMid: '#f59e0b',    // amber-500
  pointerHigh: '#8b5cf6',   // violet-500

  // Graph / tree states
  visited: '#60a5fa',       // blue-400
  current: '#f97316',       // orange-500
  queued: '#a78bfa',        // violet-400
  processed: '#34d399',     // emerald-400
  edge: '#94a3b8',          // slate-400
  edgeActive: '#f97316',    // orange-500
  edgeVisited: '#60a5fa',   // blue-400

  // UI chrome
  background: '#09090b',    // zinc-950
  surface: '#18181b',       // zinc-900
  border: '#3f3f46',        // zinc-700
  text: '#fafafa',          // zinc-50
  textMuted: '#a1a1aa',     // zinc-400
  accent: '#14b8a6',        // teal-500
  accentHover: '#2dd4bf',   // teal-400
};

/** Maximum number of elements allowed in array-based visualizations. */
export const MAX_ARRAY_SIZE = 50;

/** Maximum number of nodes allowed in graph visualizations. */
export const MAX_GRAPH_NODES = 30;
