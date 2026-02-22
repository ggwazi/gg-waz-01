export { processShim } from './process.js';
export { cryptoShim } from './crypto.js';
export { streamShim, Readable, Writable, Transform } from './stream.js';

import processShim from './process.js';
import cryptoShim from './crypto.js';
import streamShim from './stream.js';

export const shims = {
  process: processShim,
  crypto: cryptoShim,
  stream: streamShim,
};

export default shims;
