/**
 * Generate an array of random integers.
 *
 * @param {number} length - Number of elements (default 10).
 * @param {number} min    - Minimum value inclusive (default 5).
 * @param {number} max    - Maximum value inclusive (default 100).
 * @returns {number[]} Array of random integers.
 */
export function randomArray(length = 10, min = 5, max = 100) {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

/**
 * Shuffle an array in place using the Fisher-Yates algorithm.
 *
 * @param {Array} arr - The array to shuffle.
 * @returns {Array} The same array, shuffled.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Create an array of integers from start to end (inclusive).
 *
 * @param {number} start - Start value.
 * @param {number} end   - End value.
 * @returns {number[]} Array [start, start+1, ..., end].
 */
export function range(start, end) {
  const result = [];
  const step = start <= end ? 1 : -1;
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Check whether an array is sorted in ascending order.
 *
 * @param {number[]} arr - The array to check.
 * @returns {boolean} True if sorted ascending.
 */
export function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}
