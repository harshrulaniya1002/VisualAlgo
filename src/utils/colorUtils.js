import { COLORS } from './constants';

/**
 * Pre-defined color themes for the visualization platform.
 */
export const THEMES = {
  dark: {
    name: 'Dark',
    background: '#09090b',
    surface: '#18181b',
    border: '#3f3f46',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    accent: '#14b8a6',
    accentHover: '#2dd4bf',
  },
  light: {
    name: 'Light',
    background: '#fafaf9',
    surface: '#ffffff',
    border: '#e7e5e4',
    text: '#0c0a09',
    textMuted: '#78716c',
    accent: '#0d9488',
    accentHover: '#14b8a6',
  },
};

/**
 * Convert a hex color string to an { r, g, b } object.
 *
 * @param {string} hex - Color in "#rrggbb" or "#rgb" format.
 * @returns {{ r: number, g: number, b: number }} RGB components (0-255).
 */
export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB components to a hex color string.
 *
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {string} Color in "#rrggbb" format.
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Blend (linearly interpolate) between two hex colors.
 *
 * @param {string} color1 - Start color in hex.
 * @param {string} color2 - End color in hex.
 * @param {number} t      - Interpolation factor (0 = color1, 1 = color2).
 * @returns {string} Blended color in hex.
 */
export function blendColors(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const factor = Math.max(0, Math.min(1, t));

  return rgbToHex(
    c1.r + (c2.r - c1.r) * factor,
    c1.g + (c2.g - c1.g) * factor,
    c1.b + (c2.b - c1.b) * factor
  );
}

/**
 * Apply an alpha (opacity) to a hex color, returning an rgba() CSS string.
 *
 * @param {string} hex   - Color in hex.
 * @param {number} alpha - Opacity from 0 to 1.
 * @returns {string} CSS rgba() value.
 */
export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Generate a gradient palette of n colors between two hex colors.
 *
 * @param {string} startColor - Starting hex color.
 * @param {string} endColor   - Ending hex color.
 * @param {number} steps      - Number of colors to generate.
 * @returns {string[]} Array of hex color strings.
 */
export function generateGradient(startColor, endColor, steps) {
  if (steps <= 1) return [startColor];
  return Array.from({ length: steps }, (_, i) =>
    blendColors(startColor, endColor, i / (steps - 1))
  );
}

/**
 * Return the appropriate color from the shared COLORS palette for a given
 * step type. Falls back to the default bar color.
 *
 * @param {string} stepType - The step type string (e.g. "compare", "swap", "found").
 * @returns {string} Hex color.
 */
export function colorForStepType(stepType) {
  const map = {
    compare: COLORS.comparing,
    comparing: COLORS.comparing,
    swap: COLORS.swapping,
    swapping: COLORS.swapping,
    sorted: COLORS.sorted,
    found: COLORS.found,
    'not-found': COLORS.notFound,
    eliminate: COLORS.eliminate,
    visit: COLORS.visited,
    visited: COLORS.visited,
    current: COLORS.current,
    queued: COLORS.queued,
    processed: COLORS.processed,
  };

  return map[stepType] || COLORS.default;
}

/**
 * Return a contrasting text color (black or white) for a given background hex color.
 *
 * @param {string} hex - Background color in hex.
 * @returns {string} "#000000" or "#ffffff".
 */
export function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  // Perceived luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
