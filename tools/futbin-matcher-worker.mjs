import { compareFutbinSnapshot } from "./futbin-matcher.mjs";
self.onmessage = event => {
  try {
    const { snapshot, catalog, metadata } = event.data;
    self.postMessage({ result: compareFutbinSnapshot(snapshot, catalog, metadata) });
  } catch (error) {
    self.postMessage({ error: error?.message || String(error) });
  }
};

