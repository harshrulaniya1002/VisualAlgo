import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Job Sequencing with Deadlines',
  slug: 'job-sequencing',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n^2)', worst: 'O(n^2)' },
  spaceComplexity: 'O(n)',
  description:
    'Schedules jobs to maximize profit by assigning the most profitable jobs to the latest available slots before their deadlines. Input: [d1,p1, d2,p2, ...] deadline-profit pairs.',
  rendererType: 'bar',
  pseudocode: [
    'Sort jobs by profit descending',
    'for each job (deadline, profit)',
    '  for slot = deadline down to 1',
    '    if slot is free',
    '      assign job to slot, break',
    'return total profit',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 20, minValue: 1, maxValue: 99 },
  },
};

// deadline-profit pairs
export const defaultInput = [2, 100, 1, 19, 2, 27, 1, 25, 3, 15];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const jobs = [];
  for (let i = 0; i < input.length; i += 2) {
    jobs.push({ deadline: input[i], profit: input[i + 1], id: i / 2 });
  }

  const profits = jobs.map(j => j.profit);
  recorder.add('message', [], 0, `Job Sequencing: ${jobs.length} jobs`, [...profits], {});

  // Sort by profit descending
  jobs.sort((a, b) => b.profit - a.profit);
  const sortedProfits = jobs.map(j => j.profit);
  recorder.add('compute', [], 0, 'Sort jobs by profit (descending)', [...sortedProfits], {});

  const maxDeadline = Math.max(...jobs.map(j => j.deadline));
  const slots = new Array(maxDeadline + 1).fill(-1); // slot[t] = job index
  const slotViz = new Array(maxDeadline).fill(0); // profit in each slot
  let totalProfit = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    recorder.add('compare', [i], 1, `Job ${job.id} (deadline=${job.deadline}, profit=${job.profit}): find latest free slot`, [...slotViz], {});

    let assigned = false;
    for (let t = job.deadline; t >= 1; t--) {
      if (slots[t] === -1) {
        slots[t] = job.id;
        slotViz[t - 1] = job.profit;
        totalProfit += job.profit;
        assigned = true;
        recorder.add('sorted', [t - 1], 4, `Assigned to slot ${t}. Total profit = ${totalProfit}`, [...slotViz], {});
        break;
      }
    }

    if (!assigned) {
      recorder.add('compute', [i], 3, `No free slot for job ${job.id} - skipped`, [...slotViz], {});
    }
  }

  recorder.add('message', [], 5, `Maximum profit = ${totalProfit}`, [...slotViz], {});

  return recorder.getSteps();
}
