import { generateCandidateCatalog, serializeCandidateCatalog } from "./futbin-generator.mjs";
self.onmessage = event => {
  try {
    const { catalog, comparison, linksDiagnostic } = event.data;
    const result = generateCandidateCatalog(catalog, comparison, { linksDiagnostic });
    const candidateSource = result.canExport
      ? serializeCandidateCatalog(result.candidateCatalog, catalog, result.metadata) : null;
    self.postMessage({ result: { ...result, candidateSource } });
  } catch (error) {
    self.postMessage({ error: error?.message || String(error) });
  }
};
