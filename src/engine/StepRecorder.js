/**
 * Utility class that algorithms use to record visualization steps.
 *
 * Each step captures the algorithm state at a point in time so the
 * playback engine can replay the execution visually.
 */
class StepRecorder {
  constructor() {
    this.steps = [];
  }

  /**
   * Record a single algorithm step.
   *
   * @param {string}      type        - Step type (e.g. "compare", "swap", "sorted", "visit", "insert", "compute").
   * @param {number[]}    indices     - Array of relevant indices for highlighting.
   * @param {number}      codeLine    - Line number in the pseudo-code to highlight.
   * @param {string}      explanation - Human-readable explanation of what is happening.
   * @param {Array|Object} snapshot   - Current data structure state (array copy, graph, tree, grid, etc.).
   * @param {Object}      data        - Additional metadata for the step.
   */
  add(type, indices, codeLine, explanation, snapshot, data = {}) {
    this.steps.push({
      id: this.steps.length,
      type,
      indices,
      codeLine,
      explanation,
      snapshot: snapshot ? (Array.isArray(snapshot) ? [...snapshot] : JSON.parse(JSON.stringify(snapshot))) : null,
      data,
    });
  }

  /**
   * Return all recorded steps.
   *
   * @returns {Array} The array of step objects.
   */
  getSteps() {
    return this.steps;
  }
}

export default StepRecorder;
