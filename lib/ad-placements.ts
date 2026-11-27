export function listingAdPositions(
  totalCards: number,
  interval: number,
): number[] {
  if (interval < 1 || totalCards <= interval) return [];

  const positions: number[] = [];
  for (let position = interval; position < totalCards; position += interval) {
    positions.push(position);
  }
  return positions;
}

export function shouldPlaceArticleAd(
  completedSections: number,
  totalSections: number,
  initialSection: number,
  interval: number,
): boolean {
  return (
    interval > 0 &&
    completedSections >= initialSection &&
    completedSections < totalSections &&
    (completedSections - initialSection) % interval === 0
  );
}
