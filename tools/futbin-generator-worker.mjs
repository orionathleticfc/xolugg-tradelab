import { generateCandidateCatalog, serializeCandidateCatalog } from "./futbin-generator.mjs";
self.onmessage = event => {
  try {
    const { catalog, comparison } = event.data;
    const result = generateCandidateCatalog(catalog, comparison);
    const candidateSource = result.canExport ? serializeCandidateCatalog(result.candidateCatalog, catalog) : null;
    self.postMessage({ result: { ...result, candidateSource } });
  } catch (error) {
    self.postMessage({ error: error?.message || String(error) });
  }
};
