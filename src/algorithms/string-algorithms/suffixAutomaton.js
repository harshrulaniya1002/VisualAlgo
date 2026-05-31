import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Suffix Automaton',
  slug: 'suffix-automaton',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'A suffix automaton (DAWG) is the smallest deterministic automaton that recognizes all suffixes of a string. It is built incrementally by adding one character at a time, creating at most 2n states and 3n transitions. Each state represents a set of end positions (endpos equivalence class).',
  rendererType: 'bar',
  pseudocode: [
    'Create initial state (root)',
    'for each character c:',
    '  create new state cur',
    '  walk from last via suffix links',
    '  if no transition on c: add transition, continue',
    '  if transition exists and edge is continuous: set suffix link',
    '  else: clone state, redirect transitions',
    '  last = cur',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// String "ABCBC" as char codes
export const defaultInput = [65, 66, 67, 66, 67];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));
  const str = chars.join('');

  recorder.add('message', [], 0,
    `Building suffix automaton for "${str}" (length ${n})`,
    [...arr], { string: str });

  // State: { len, link, transitions: {}, isClone: false }
  const states = [];
  let stateCount = 0;

  function newState(len, link) {
    const id = stateCount++;
    states.push({ id, len, link, transitions: {}, isClone: false });
    return id;
  }

  // Initial state (root)
  const root = newState(0, -1);
  let last = root;

  recorder.add('compute', [], 0,
    `Create initial state (root): state 0, len = 0, link = -1`,
    [...arr], { stateCount: 1 });

  for (let i = 0; i < n; i++) {
    const c = arr[i];
    const ch = chars[i];

    recorder.add('visit', [i], 1,
      `Adding character '${ch}' (code ${c}), position ${i}`,
      [...arr], { i, char: ch });

    // Create new state for current suffix
    const cur = newState(states[last].len + 1, -1);
    recorder.add('compute', [i], 2,
      `Create state ${cur}: len = ${states[cur].len}`,
      [...arr], { state: cur, len: states[cur].len });

    // Walk from last via suffix links
    let p = last;

    while (p !== -1 && states[p].transitions[c] === undefined) {
      states[p].transitions[c] = cur;
      recorder.add('compute', [], 3,
        `Add transition: state ${p} --'${ch}'--> state ${cur}`,
        [...arr], { from: p, to: cur, char: ch });
      p = states[p].link;
    }

    if (p === -1) {
      // All states traversed, no existing transition on c
      states[cur].link = root;
      recorder.add('compute', [], 4,
        `Reached root without finding transition on '${ch}'. Set suffix link: state ${cur} -> root (state 0)`,
        [...arr], { state: cur, link: root });
    } else {
      const q = states[p].transitions[c];

      if (states[p].len + 1 === states[q].len) {
        // Edge is continuous (no clone needed)
        states[cur].link = q;
        recorder.add('compute', [], 5,
          `Transition found: state ${p} --'${ch}'--> state ${q}. Edge is continuous (len ${states[p].len} + 1 = ${states[q].len}). Set suffix link: state ${cur} -> state ${q}`,
          [...arr], { state: cur, link: q, continuous: true });
      } else {
        // Need to clone state q
        const clone = newState(states[p].len + 1, states[q].link);
        states[clone].transitions = { ...states[q].transitions };
        states[clone].isClone = true;

        recorder.add('compute', [], 6,
          `Clone needed: state ${q} has len ${states[q].len} but expected ${states[p].len + 1}. Create clone state ${clone} with len ${states[clone].len}`,
          [...arr], { clone, original: q, cloneLen: states[clone].len });

        // Redirect transitions from p and ancestors that pointed to q
        while (p !== -1 && states[p].transitions[c] === q) {
          states[p].transitions[c] = clone;
          recorder.add('compute', [], 6,
            `Redirect: state ${p} --'${ch}'--> state ${clone} (was state ${q})`,
            [...arr], { from: p, to: clone, was: q });
          p = states[p].link;
        }

        states[q].link = clone;
        states[cur].link = clone;

        recorder.add('compute', [], 6,
          `Update suffix links: state ${q} -> state ${clone}, state ${cur} -> state ${clone}`,
          [...arr], { qLink: clone, curLink: clone });
      }
    }

    last = cur;

    recorder.add('highlight', [i], 1,
      `After adding '${ch}': automaton has ${stateCount} states. Last = state ${last}`,
      [...arr], { stateCount, last });
  }

  // Summary: show states and their properties
  recorder.add('message', [], 0,
    `Suffix automaton construction complete. Total states: ${stateCount} (max possible: ${2 * n}).`,
    [...arr], { totalStates: stateCount });

  // Show all suffixes recognized by the automaton
  const suffixes = [];
  for (let i = 0; i < n; i++) {
    suffixes.push(chars.slice(i).join(''));
  }

  for (let i = 0; i < stateCount; i++) {
    const s = states[i];
    const transKeys = Object.keys(s.transitions).map(k => `'${String.fromCharCode(k)}'->s${s.transitions[k]}`);
    recorder.add('sorted', [], 0,
      `State ${i}: len=${s.len}, link=${s.link}${s.isClone ? ' (clone)' : ''}, transitions: {${transKeys.join(', ')}}`,
      [...arr], { state: i, len: s.len, link: s.link, isClone: s.isClone });
  }

  recorder.add('sorted', [], 0,
    `Suffix automaton recognizes all ${n} suffixes of "${str}": ${suffixes.map(s => '"' + s + '"').join(', ')}. States: ${stateCount}, transitions: ${states.reduce((sum, s) => sum + Object.keys(s.transitions).length, 0)}.`,
    [...arr], { suffixes, stateCount });

  return recorder.getSteps();
}
