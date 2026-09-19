import { inspectUrl } from './futbin-links.mjs';

export function validFutbin(value) {
  return !!value && value.game === 27 && Number.isSafeInteger(value.playerId) && value.playerId > 0 &&
    typeof value.slug === 'string' && /^[^\s/?#]+$/.test(value.slug) &&
    value.url === 'https://www.futbin.com/' + value.game + '/player/' + value.playerId + '/' + value.slug &&
    inspectUrl(value.url).playerId === String(value.playerId);
}

/**
 * Compatibility audit for pre-authoritative callers. Fase 10 attaches exact
 * geometry-derived links to snapshot cards before candidate generation.
 */
export function applyCatalogLinks(current, candidate, comparison, diagnostic, same) {
  const previousByPlayerId = new Map(current.filter(record => validFutbin(record.futbin))
    .map(record => [record.futbin.playerId, record]));
  const audit = candidate.map((record, candidateIndex) => {
    const previous = validFutbin(record.futbin)
      ? previousByPlayerId.get(record.futbin.playerId) : null;
    return {
      candidateIndex, id: record.id, nombre: record.nombre,
      playerId: record.futbin?.playerId ?? null,
      status: !validFutbin(record.futbin) ? 'MISSING'
        : previous && same(previous.futbin, record.futbin) ? 'PRESERVED' : 'APPLIED'
    };
  });
  const preserved = audit.filter(entry => entry.status === 'PRESERVED').map(entry => ({
    id: entry.id, candidateIndex: entry.candidateIndex,
    futbin: structuredClone(candidate[entry.candidateIndex].futbin),
    reason: 'SAME_EXACT_PLAYER_ID'
  }));
  const count = status => audit.filter(entry => entry.status === status).length;
  return {
    audit, preserved, summary: {
      futbinLinksApplied: count('APPLIED'), futbinLinksPreserved: preserved.length,
      futbinLinksSkippedDuplicates: 0, futbinLinksSkippedNeedsReview: 0,
      futbinLinksMissing: count('MISSING'), futbinLinksInvalid: 0,
      futbinLinksConflicts: 0, futbinLinksUnsafe: 0
    }
  };
}
