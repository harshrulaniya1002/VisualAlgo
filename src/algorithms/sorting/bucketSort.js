import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bucket Sort',
  slug: 'bucket-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(n + k)',
  stable: true,
  description:
    'Bucket Sort distributes elements into a number of buckets based on their value range. Each bucket is then sorted individually (using insertion sort or another algorithm), and the sorted buckets are concatenated to produce the final sorted array.',
  rendererType: 'bar',
  pseudocode: [
    'find min and max values',
    'create buckets based on value range',
    'for each element in arr',
    '  place element in appropriate bucket',
    'sort each bucket (insertion sort)',
    'concatenate all buckets into arr',
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

export const defaultInput = [42, 32, 23, 52, 25, 47, 51, 33];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Bucket Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)));
  const range = max - min + 1;
  const bucketSize = Math.ceil(range / bucketCount);

  recorder.add(
    'message',
    [],
    0,
    `Range: [${min}, ${max}], using ${bucketCount} buckets, each covering ~${bucketSize} values`,
    [...arr],
    { min, max, bucketCount, bucketSize }
  );

  // Create buckets
  const buckets = Array.from({ length: bucketCount }, () => []);

  // Distribute elements into buckets
  recorder.add(
    'message',
    [],
    1,
    'Distributing elements into buckets',
    [...arr],
    {}
  );

  for (let i = 0; i < n; i++) {
    const bucketIdx = Math.min(
      Math.floor((arr[i] - min) / bucketSize),
      bucketCount - 1
    );

    buckets[bucketIdx].push(arr[i]);

    recorder.add(
      'highlight',
      [i],
      3,
      `Place arr[${i}] = ${arr[i]} into bucket ${bucketIdx} (range ${min + bucketIdx * bucketSize}-${Math.min(min + (bucketIdx + 1) * bucketSize - 1, max)})`,
      [...arr],
      { bucketIdx, buckets: buckets.map((b) => [...b]) }
    );
  }

  // Sort each bucket using insertion sort
  recorder.add(
    'message',
    [],
    4,
    'Sorting each bucket individually',
    [...arr],
    {}
  );

  for (let b = 0; b < bucketCount; b++) {
    if (buckets[b].length <= 1) continue;

    recorder.add(
      'message',
      [],
      4,
      `Sorting bucket ${b}: [${buckets[b].join(', ')}]`,
      [...arr],
      { bucket: b }
    );

    // Insertion sort on bucket
    const bucket = buckets[b];
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }

    recorder.add(
      'message',
      [],
      4,
      `Bucket ${b} sorted: [${buckets[b].join(', ')}]`,
      [...arr],
      { bucket: b, sorted: [...buckets[b]] }
    );
  }

  // Concatenate buckets back into arr
  recorder.add(
    'message',
    [],
    5,
    'Concatenating sorted buckets back into array',
    [...arr],
    {}
  );

  let idx = 0;
  for (let b = 0; b < bucketCount; b++) {
    for (let j = 0; j < buckets[b].length; j++) {
      arr[idx] = buckets[b][j];

      recorder.add(
        'highlight',
        [idx],
        5,
        `Place ${buckets[b][j]} from bucket ${b} at position ${idx}`,
        [...arr],
        {}
      );

      idx++;
    }
  }

  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      5,
      `Element ${arr[i]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Bucket Sort complete!', [...arr], {});

  return recorder.getSteps();
}
