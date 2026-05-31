import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Queue Operations',
  slug: 'queue-operations',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  description:
    'Demonstrates enqueue, dequeue, and front operations on a FIFO (First In, First Out) data structure.',
  rendererType: 'bar',
  pseudocode: [
    'enqueue(x): queue[rear++] = x',
    'dequeue(): return queue[front++]',
    'front(): return queue[front]',
    'isEmpty(): return front == rear',
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

export const defaultInput = [8, 3, 5, 1, 9, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const queue = [];

  recorder.add(
    'message',
    [],
    0,
    'Starting Queue Operations demo. We will enqueue all elements, then peek at front, and dequeue them.',
    [],
    {}
  );

  // Phase 1: Enqueue all elements
  for (let i = 0; i < arr.length; i++) {
    queue.push(arr[i]);
    recorder.add(
      'insert',
      [queue.length - 1],
      0,
      `Enqueue ${arr[i]} at the rear. Queue size = ${queue.length}.`,
      [...queue],
      { operation: 'enqueue', value: arr[i] }
    );
  }

  // Phase 2: Front peek
  recorder.add(
    'visit',
    [0],
    2,
    `Front: the element at the front of the queue is ${queue[0]}.`,
    [...queue],
    { operation: 'front', value: queue[0] }
  );

  // Phase 3: Dequeue all elements
  while (queue.length > 0) {
    const val = queue.shift();
    recorder.add(
      'swap',
      [0],
      1,
      `Dequeue ${val} from the front. Queue size = ${queue.length}.`,
      [...queue],
      { operation: 'dequeue', value: val }
    );
  }

  // Phase 4: isEmpty check
  recorder.add(
    'message',
    [],
    3,
    `isEmpty: queue is empty (size = 0). All operations complete.`,
    [],
    { operation: 'isEmpty', result: true }
  );

  return recorder.getSteps();
}
