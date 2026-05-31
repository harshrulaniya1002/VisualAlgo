import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Deque (Double-Ended Queue)',
  slug: 'deque',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  description:
    'A generalized queue supporting insertion and deletion at both the front and rear ends in constant time. Demonstrates pushFront, pushBack, popFront, and popBack operations.',
  rendererType: 'bar',
  pseudocode: [
    'pushFront(x): insert x at front',
    'pushBack(x): insert x at rear',
    'popFront(): remove and return front',
    'popBack(): remove and return rear',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [4, 7, 2, 9, 1, 5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const deque = [];

  recorder.add(
    'message',
    [],
    0,
    'Starting Deque demo. We will use pushBack, pushFront, popFront, and popBack operations.',
    [],
    {}
  );

  // Phase 1: pushBack first half of elements
  const mid = Math.ceil(arr.length / 2);
  for (let i = 0; i < mid; i++) {
    deque.push(arr[i]);
    recorder.add(
      'insert',
      [deque.length - 1],
      1,
      `pushBack(${arr[i]}). Deque: [${deque.join(', ')}].`,
      [...deque],
      { operation: 'pushBack', value: arr[i] }
    );
  }

  // Phase 2: pushFront remaining elements
  for (let i = mid; i < arr.length; i++) {
    deque.unshift(arr[i]);
    recorder.add(
      'insert',
      [0],
      0,
      `pushFront(${arr[i]}). Deque: [${deque.join(', ')}].`,
      [...deque],
      { operation: 'pushFront', value: arr[i] }
    );
  }

  // Phase 3: Peek at both ends
  recorder.add(
    'visit',
    [0, deque.length - 1],
    0,
    `Front = ${deque[0]}, Rear = ${deque[deque.length - 1]}. Deque size = ${deque.length}.`,
    [...deque],
    { front: deque[0], rear: deque[deque.length - 1] }
  );

  // Phase 4: popFront half, popBack the rest
  const popFrontCount = Math.ceil(deque.length / 2);
  let popped = 0;

  while (popped < popFrontCount && deque.length > 0) {
    const val = deque.shift();
    recorder.add(
      'swap',
      [0],
      2,
      `popFront() = ${val}. Deque: [${deque.join(', ')}].`,
      [...deque],
      { operation: 'popFront', value: val }
    );
    popped++;
  }

  while (deque.length > 0) {
    const lastIdx = deque.length - 1;
    const val = deque.pop();
    recorder.add(
      'swap',
      [lastIdx],
      3,
      `popBack() = ${val}. Deque: [${deque.join(', ')}].`,
      [...deque],
      { operation: 'popBack', value: val }
    );
  }

  recorder.add(
    'message',
    [],
    0,
    'Deque operations complete. All insertions and removals at both ends run in O(1).',
    [],
    {}
  );

  return recorder.getSteps();
}
