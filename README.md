# AlmostNode

A browser-based Node.js runtime environment that runs Node.js code directly in the browser without any server infrastructure.

## Features

- **Virtual File System**: In-memory file system with read/write operations
- **JavaScript/TypeScript Runtime**: Execute JavaScript code directly in the browser
- **Node.js API Shims**: Compatible with common Node.js modules (fs, path, buffer, events, util, crypto, stream)
- **Package Manager**: Install and manage npm packages in the browser
- **Server Bridge**: Route HTTP requests to virtual servers
- **TypeScript Support**: Built entirely with TypeScript for type safety
- **Lightweight**: Approximately 250KB gzipped

## Installation

```bash
npm install almostnode
```

## Quick Start

### Using the Library

```typescript
import { createDefaultContainer } from 'almostnode';

const container = createDefaultContainer();

// Execute JavaScript code
const result = await container.runtime.execute(`
  console.log('Hello from AlmostNode!');
  console.log(Math.sqrt(16));
`);

console.log(result.stdout);

// Work with the file system
await container.fs.writeFile('/hello.txt', 'Hello, World!');
const content = await container.fs.readFile('/hello.txt', 'utf-8');
console.log(content);

// Use Node.js modules
const path = container.packageManager.require('path');
const joined = path.join('/a', 'b', 'c');
console.log(joined);
```

### Web Interface

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { createDefaultContainer } from 'almostnode';
      window.almostNode = createDefaultContainer();
    </script>
  </head>
  <body>
    <textarea id="code"></textarea>
    <button onclick="runCode()">Run</button>
    <pre id="output"></pre>

    <script>
      async function runCode() {
        const code = document.getElementById('code').value;
        const result = await window.almostNode.runtime.execute(code);
        document.getElementById('output').textContent = result.stdout;
      }
    </script>
  </body>
</html>
```

## API Reference

### Container

The main entry point for AlmostNode.

```typescript
interface AlmostNodeContainer {
  fs: VirtualFileSystem;
  runtime: Runtime;
  packageManager: PackageManager;
  serverBridge: ServerBridge;
}
```

### Virtual File System

```typescript
interface VirtualFileSystem {
  readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
  writeFile(path: string, content: string | Buffer): Promise<void>;
  mkdir(path: string): Promise<void>;
  rm(path: string, recursive?: boolean): Promise<void>;
  ls(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStat>;
}
```

### Runtime

```typescript
interface Runtime {
  execute(code: string, options?: RuntimeOptions): Promise<ExecutionResult>;
  eval(code: string): unknown;
}
```

### Package Manager

```typescript
interface PackageManager {
  install(name: string, version?: string): Promise<void>;
  require(moduleName: string): unknown;
}
```

## Examples

### File System Operations

```typescript
const container = createDefaultContainer();

// Create directories
await container.fs.mkdir('/myproject/src');

// Write files
await container.fs.writeFile('/myproject/src/index.ts', 'export const hello = "world";');

// Read files
const code = await container.fs.readFile('/myproject/src/index.ts', 'utf-8');

// List directory contents
const files = await container.fs.ls('/myproject/src');

// Check if file exists
const exists = await container.fs.exists('/myproject/src/index.ts');

// Get file statistics
const stat = await container.fs.stat('/myproject/src/index.ts');
console.log(`File size: ${stat.size} bytes`);

// Delete files
await container.fs.rm('/myproject/src/index.ts');
await container.fs.rm('/myproject', true); // recursive
```

### Code Execution

```typescript
const container = createDefaultContainer();

// Execute code with console output
const result = await container.runtime.execute(`
  const numbers = [1, 2, 3, 4, 5];
  const sum = numbers.reduce((a, b) => a + b, 0);
  console.log('Sum:', sum);
`);

console.log('stdout:', result.stdout);
console.log('stderr:', result.stderr);
console.log('exit code:', result.code);
console.log('execution time:', result.time, 'ms');

// Evaluate expressions
const value = container.runtime.eval('2 + 2');
console.log(value); // 4
```

### Using Node.js Modules

```typescript
const container = createDefaultContainer();

// Path module
const path = container.packageManager.require('path');
console.log(path.join('/a', 'b', 'c')); // /a/b/c
console.log(path.dirname('/a/b/c.js')); // /a/b

// File system module
const fs = container.packageManager.require('fs');

// Events module
const { EventEmitter } = container.packageManager.require('events');

// Util module
const util = container.packageManager.require('util');
console.log(util.format('Hello %s', 'World')); // Hello World
```

## Supported Node.js Modules

- **fs**: File system operations (readFile, writeFile, mkdir, rm, ls, exists, stat)
- **path**: Path utilities (join, resolve, dirname, basename, extname)
- **buffer**: Buffer operations (from, alloc, allocUnsafe, isBuffer)
- **events**: EventEmitter class
- **util**: Utility functions (format, inspect, inherits)
- **process**: Process information (env, cwd, argv, exit, etc.)
- **crypto**: Cryptographic functions (randomBytes, randomUUID, subtle)
- **stream**: Stream classes (Readable, Writable, Transform)

## Architecture

AlmostNode is built with a modular architecture:

```
AlmostNode Container
├── Virtual File System
├── Runtime (JavaScript/TypeScript execution)
├── Package Manager (Node.js module shims)
└── Server Bridge (HTTP routing)
```

## Development

### Running the Development Server

```bash
npm run dev
```

### Building the Project

```bash
npm run build
```

### Running Tests

```bash
npm run test
npm run test:ui
npm run test:e2e
```

### Type Checking

```bash
npm run type-check
```

## Performance

- Lightweight: ~250KB gzipped
- Fast startup: Initializes instantly
- No server required: Runs entirely in the browser
- Suitable for: Educational purposes, prototyping, sandboxed code execution

## Limitations

- No native module support
- Limited to browser APIs and Node.js shims
- Single-threaded execution
- No cluster/worker thread support
- Time and resource limits apply

## Testing

AlmostNode includes comprehensive tests:

- **Unit Tests**: 50+ tests covering all modules
- **Integration Tests**: Testing module interactions
- **E2E Tests**: Playwright tests for the demo interface

Run all tests with:

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] TypeScript compilation in the browser
- [ ] More Node.js module shims (os, url, querystring, etc.)
- [ ] Hot Module Replacement support
- [ ] Virtual environment variables
- [ ] Performance improvements
- [ ] Module bundling support