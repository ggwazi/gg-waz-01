export const processShim = {
  env: {
    NODE_ENV: 'browser',
    ...process.env,
  },
  cwd: () => '/',
  argv: ['node', 'script.js'],
  exit: (code?: number) => {
    console.log(`Process exited with code ${code || 0}`);
  },
  nextTick: (callback: () => void) => {
    Promise.resolve().then(callback);
  },
  platform: 'browser',
  arch: 'wasm',
  version: 'v20.0.0',
  versions: {
    node: '20.0.0',
    v8: '12.0.0',
    uv: '1.44.2',
    zlib: '1.2.13',
  },
  stdin: {
    isTTY: false,
  },
  stdout: {
    isTTY: false,
    write: (chunk: string) => console.log(chunk),
  },
  stderr: {
    isTTY: false,
    write: (chunk: string) => console.error(chunk),
  },
};

export default processShim;
