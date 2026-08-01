export type LineDiff = { type: "same" | "removed" | "added"; text: string };

// Classic LCS-based line diff (like `git diff`, minus the unified hunk
// format) — used to highlight exactly which lines changed between two
// JSON-pretty-printed values, rather than showing two undifferentiated
// blobs. Inputs here are always small (a single record's JSON), so the
// O(m*n) DP table is never a performance concern.
export function diffLines(before: string[], after: string[]): LineDiff[] {
  const m = before.length;
  const n = after.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = before[i] === after[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: LineDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (before[i] === after[j]) {
      result.push({ type: "same", text: before[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: before[i] });
      i++;
    } else {
      result.push({ type: "added", text: after[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: before[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", text: after[j] });
    j++;
  }
  return result;
}
