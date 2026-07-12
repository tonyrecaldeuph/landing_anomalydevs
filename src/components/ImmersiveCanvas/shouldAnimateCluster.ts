/** Only the active cluster needs its per-frame wobble recomputed — inactive ones sit dimmed and static. */
export function shouldAnimateCluster(index: number, currentCluster: number): boolean {
  return index === currentCluster;
}
