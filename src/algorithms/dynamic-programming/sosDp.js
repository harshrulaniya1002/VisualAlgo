import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sum over Subsets (SOS) DP',
  slug: 'sos-dp',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * 2^n)', average: 'O(n * 2^n)', worst: 'O(n * 2^n)' },
  spaceComplexity: 'O(2^n)',
  description:
    'Computes the sum of values over all subsets of each bitmask efficiently. For each mask, computes the sum of f[sub] for all sub that are subsets of mask. Input: values for masks 0..2^n-1.',
  rendererType: 'bar',
  pseudocode: [
    'dp[mask] = f[mask] for all mask',
    'for bit = 0 to n-1',
    '  for mask = 0 to 2^n - 1',
    '    if mask has bit set',
    '      dp[mask] += dp[mask ^ (1<<bit)]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 16, minValue: 0, maxValue: 50 },
  },
};

// Values for 2^3 = 8 masks (n=3 bits)
export const defaultInput = [2, 5, 1, 7, 3, 8, 4, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const f = [...input];
  const totalMasks = f.length;
  const n = Math.round(Math.log2(totalMasks));
  const dp = [...f];

  recorder.add('message', [], 0, `SOS DP: ${n} bits, ${totalMasks} masks. f = [${f}]`, [...dp], {});
  recorder.add('compute', [], 0, `Initialize dp[mask] = f[mask] for all masks`, [...dp], {});

  for (let bit = 0; bit < n; bit++) {
    recorder.add('message', [], 1, `Processing bit ${bit}`, [...dp], {});

    for (let mask = 0; mask < totalMasks; mask++) {
      if (mask & (1 << bit)) {
        const partner = mask ^ (1 << bit);
        const oldVal = dp[mask];
        dp[mask] += dp[partner];

        recorder.add('compute', [mask], 4, `dp[${mask.toString(2).padStart(n, '0')}] += dp[${partner.toString(2).padStart(n, '0')}]: ${oldVal} + ${dp[partner]} = ${dp[mask]}`, [...dp], {});
      }
    }
  }

  recorder.add('message', [], 4, `SOS DP complete. dp = [${dp}]`, [...dp], {});
  recorder.add('sorted', [totalMasks - 1], 4, `dp[${(totalMasks - 1).toString(2).padStart(n, '0')}] = ${dp[totalMasks - 1]} (sum of all f values)`, [...dp], {});

  return recorder.getSteps();
}
