import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'LRU Cache',
  slug: 'lru-cache',
  category: 'linked-lists',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  description:
    'Implements a Least Recently Used cache using a doubly linked list and hash map. Get and put operations run in O(1). When the cache reaches capacity, the least recently used item is evicted.',
  rendererType: 'bar',
  pseudocode: [
    'get(key): if key in map, move to front, return value',
    'put(key, val): if key exists, update and move to front',
    '  if full, remove tail (LRU item)',
    '  insert new node at front',
    'moveToFront(node): remove from current, add to head',
    'evict(): remove tail node, delete from map',
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

// Operations encoded as array: [capacity, op, key, value, op, key, value, ...]
// op: 0 = put, 1 = get
// Format: [capacity, ...operations_as_values]
export const defaultInput = [3, 10, 20, 30, 40, 20, 50];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const values = [...input];
  const capacity = Math.max(2, Math.min(values[0] || 3, 5));
  const operations = values.slice(1);

  recorder.add(
    'message',
    [],
    0,
    `LRU Cache with capacity ${capacity}. Will process ${operations.length} put operations with keys: [${operations.join(', ')}]`,
    [],
    { capacity }
  );

  // Simulate LRU cache with an array (most recent at front)
  const cache = []; // Array of values representing cache state (front = most recent)

  for (let i = 0; i < operations.length; i++) {
    const key = operations[i];
    const existingIdx = cache.indexOf(key);

    if (existingIdx !== -1) {
      // Key exists - move to front (most recently used)
      recorder.add(
        'compare',
        [existingIdx],
        0,
        `Put(${key}): Key ${key} found in cache at position ${existingIdx}`,
        [...cache],
        { key, position: existingIdx }
      );

      // Remove from current position
      cache.splice(existingIdx, 1);

      recorder.add(
        'swap',
        cache.length > 0 ? [0] : [],
        4,
        `Move ${key} to front (most recently used)`,
        [...cache],
        { key }
      );

      // Add to front
      cache.unshift(key);

      recorder.add(
        'insert',
        [0],
        4,
        `Cache after move-to-front: [${cache.join(', ')}]`,
        [...cache],
        { key }
      );
    } else {
      // Key does not exist
      if (cache.length >= capacity) {
        // Evict LRU (last element)
        const evicted = cache[cache.length - 1];

        recorder.add(
          'highlight',
          [cache.length - 1],
          2,
          `Cache full (${cache.length}/${capacity}). Evicting LRU item: ${evicted} (tail)`,
          [...cache],
          { evicted }
        );

        cache.pop();

        recorder.add(
          'visit',
          cache.length > 0 ? [cache.length - 1] : [],
          2,
          `Evicted ${evicted}. Cache: [${cache.join(', ')}]`,
          [...cache],
          { evicted }
        );
      }

      // Insert new key at front
      cache.unshift(key);

      recorder.add(
        'insert',
        [0],
        3,
        `Put(${key}): Insert ${key} at front. Cache: [${cache.join(', ')}] (${cache.length}/${capacity})`,
        [...cache],
        { key, cacheSize: cache.length }
      );
    }

    // Show current cache state
    const stateIndices = [];
    for (let j = 0; j < cache.length; j++) stateIndices.push(j);

    recorder.add(
      'compute',
      stateIndices,
      0,
      `Cache state after operation ${i + 1}: [${cache.map((v, idx) => idx === 0 ? `${v}(MRU)` : idx === cache.length - 1 ? `${v}(LRU)` : `${v}`).join(', ')}]`,
      [...cache],
      { step: i + 1 }
    );
  }

  // Final state
  for (let i = 0; i < cache.length; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Position ${i}: ${cache[i]}${i === 0 ? ' (Most Recently Used)' : i === cache.length - 1 ? ' (Least Recently Used)' : ''}`,
      [...cache],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `LRU Cache simulation complete. Final cache: [${cache.join(', ')}]`,
    [...cache],
    {}
  );

  return recorder.getSteps();
}
