export type BudgetVerdict = 'pending' | 'ok' | 'degrade';

interface FrameBudgetOptions {
  /** Frames to average before deciding. */
  windowFrames: number;
  minFps: number;
}

/**
 * Watches the first frames of the scene and decides once whether this device can afford the
 * expensive effects. Deciding once avoids flip-flopping quality mid-experience.
 */
export function createFrameBudget({ windowFrames, minFps }: FrameBudgetOptions) {
  let frames = 0;
  let totalMs = 0;
  let verdict: BudgetVerdict = 'pending';

  return {
    sample(frameMs: number): BudgetVerdict {
      if (verdict !== 'pending') return verdict;
      frames++;
      totalMs += frameMs;
      if (frames < windowFrames) return 'pending';
      const fps = 1000 / (totalMs / frames);
      verdict = fps >= minFps ? 'ok' : 'degrade';
      return verdict;
    },
  };
}
