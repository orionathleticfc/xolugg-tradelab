import { parseFutbinDiagnostic } from "./futbin-parser.mjs";

self.onmessage = event => {
  try {
    self.postMessage({ result: parseFutbinDiagnostic(event.data) });
  } catch (error) {
    self.postMessage({ error: error?.message || String(error) });
  }
};

