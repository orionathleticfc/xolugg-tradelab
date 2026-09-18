import { buildLinksDiagnostic, inspectUrl } from './futbin-links.mjs';
import { normalizeIdentity } from './futbin-matcher.mjs';

export function validFutbin(value) {
  return !!value && value.game === 27 && Number.isSafeInteger(value.playerId) && value.playerId > 0 &&
    typeof value.slug === 'string' && /^[^\s/?#]+$/.test(value.slug) &&
    value.url === `https://www.futbin.com/${value.game}/player/${value.playerId}/${value.slug}`;
}

// Recompute geometry against this comparison to prevent stale index associations.
export function applyCatalogLinks(current, candidate, comparison, diagnostic, same) {
  const rows = [...comparison.updated, ...comparison.unchanged, ...comparison.new,
    ...comparison.needsReview, ...comparison.snapshotDuplicates.flatMap(g => g.occurrences)];
  const ordered = [...rows].sort((a, b) => a.snapshotIndex - b.snapshotIndex);
  const usable = diagnostic && diagnostic.metadata?.fileName === comparison.metadata?.fileName &&
    ordered.every((row, index) => row.snapshotIndex === index);
  const evidence = usable ? buildLinksDiagnostic({ ...diagnostic.metadata,
    annotations: diagnostic.annotations, pageInfo: diagnostic.pageInfo || [] },
    ordered.map(row => row.parserCard || row.pdfCard)) : null;
  const audit = [];
  const duplicates = new Set(comparison.snapshotDuplicates.flatMap(g => g.snapshotIndices));
  const review = new Set(comparison.needsReview.map(r => r.snapshotIndex));
  const blockedCatalog = new Set([
    ...comparison.needsReview.flatMap(r => r.candidates || []),
    ...comparison.snapshotDuplicates.flatMap(g => g.occurrences.flatMap(r => r.candidates || []))
  ].map(c => c.catalogIndex));
  const claims = new Map();
  for (const row of rows) if (Number.isInteger(row.catalogIndex)) {
    claims.set(row.catalogIndex, (claims.get(row.catalogIndex) || 0) + 1);
  }
  for (const row of ordered) {
    const existing = current[row.catalogIndex];
    const link = evidence?.cards[row.snapshotIndex];
    const entry = { snapshotIndex: row.snapshotIndex, catalogIndex: row.catalogIndex,
      id: existing?.id ?? null, candidateIds: (row.candidates || []).map(c => c.record?.id), nombre: row.pdfCard?.nombre, status: null,
      linkStatus: link?.status ?? 'NO_LINK', urls: link?.urls || [] };
    audit.push(entry);
    if (duplicates.has(row.snapshotIndex)) { entry.status = 'SKIPPED_DUPLICATE'; continue; }
    if (review.has(row.snapshotIndex)) { entry.status = 'SKIPPED_NEEDS_REVIEW'; continue; }
    if (!['UPDATED', 'UNCHANGED'].includes(row.status) || row.matchReason !== 'exact_identity' ||
        row.confidence !== 'high' || !existing || !same(existing, row.currentRecord) ||
        !same(normalizeIdentity(existing), normalizeIdentity(row.pdfCard)) ||
        blockedCatalog.has(row.catalogIndex) || claims.get(row.catalogIndex) !== 1) {
      entry.status = 'UNSAFE_MATCH'; continue;
    }
    if (link?.status !== 'MATCHED' || link.urls.length !== 1) {
      entry.status = 'MISSING'; continue;
    }
    const inspected = inspectUrl(link.urls[0]);
    const next = { game: inspected.game, playerId: Number(inspected.playerId),
      slug: inspected.slug, url: inspected.url };
    if (!validFutbin(next)) { entry.status = 'INVALID_LINK'; continue; }
    entry.previous = existing.futbin ?? null;
    entry.proposed = next;
    if (existing.futbin && existing.futbin.playerId !== next.playerId) {
      entry.status = 'PLAYER_ID_CONFLICT'; continue;
    }
    if (same(existing.futbin, next)) { entry.status = 'PRESERVED'; continue; }
    candidate[row.catalogIndex].futbin = next;
    entry.status = 'APPLIED';
  }
  const preserved = current.flatMap((record, index) => record.futbin && same(record.futbin, candidate[index].futbin)
    ? [{ id: record.id, catalogIndex: index, futbin: structuredClone(record.futbin),
      reason: audit.find(e => e.catalogIndex === index)?.status || 'NO_SAFE_NEW_EVIDENCE' }] : []);
  const count = status => audit.filter(e => e.status === status).length;
  return { audit, preserved, summary: {
    futbinLinksApplied: count('APPLIED'), futbinLinksPreserved: preserved.length,
    futbinLinksSkippedDuplicates: count('SKIPPED_DUPLICATE'),
    futbinLinksSkippedNeedsReview: count('SKIPPED_NEEDS_REVIEW'),
    futbinLinksMissing: count('MISSING'), futbinLinksInvalid: count('INVALID_LINK'),
    futbinLinksConflicts: count('PLAYER_ID_CONFLICT'), futbinLinksUnsafe: count('UNSAFE_MATCH')
  } };
}
