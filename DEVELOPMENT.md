# Development Guide for AlmostNode

This guide explains the architecture and development workflow for AlmostNode.

## Project Structure

```
almostnode/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── vite-plugin.ts           # Vite plugin for development
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── modules/
│   │   ├── virtual-fs.ts        # Virtual File System implementation
│   │   ├── runtime.ts           # JavaScript/TypeScript runtime
│   │   ├── package-manager.ts   # Package manager with Node.js shims
│   │   ├── server-bridge.ts     # HTTP server routing
│   │   └── container.ts         # Main container orchestrating all modules
│   └── shims/
│       ├── process.ts           # process object shim
│       ├── crypto.ts            # crypto module shim
│       ├── stream.ts            # stream module shim
│       └── index.ts             # Shims export
├── examples/
│   ├── react-app.tsx            # React demo component
│   ├── express-server.ts        # Express.js mock server
│   └── bash-shell.ts            # Bash shell emulator
├── tests/
│   ├── unit/                    # Unit tests
│   │   ├── virtual-fs.test.ts
│   │   ├── runtime.test.ts
│   │   └── package-manager.test.ts
│   └── e2e/
│       └── demo.spec.ts         # End-to-end tests
├── index.html                   # Demo HTML page
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

## Core Modules

### Virtual File System (`src/modules/virtual-fs.ts`)

Implements an in-memory file system with standard operations:
- `readFile()` - Read file contents
- `writeFile()` - Write file contents
- `mkdir()` - Create directories
- `rm()` - Remove files/directories
- `ls()` - List directory contents
- `exists()` - Check file existence
- `stat()` - Get file statistics

**Implementation Details:**
- Uses a tree structure with `FileSystemEntry` nodes
- Maintains file cache for performance
- Normalizes paths to handle various formats
- Supports nested directory creation

### Runtime (`src/modules/runtime.ts`)

Executes JavaScript code in a sandboxed environment:
- `execute()` - Run code with console capture
- `eval()` - Evaluate expressions
- Provides global context (console, Promise, Math, etc.)
- Captures stdout/stderr and execution time
- Supports timeout handling

**Implementation Details:**
- Uses `Function` constructor for code execution
- Creates isolated global context for each execution
- Intercepts console methods for output capture
- Measures execution time with `performance.now()`

### Package Manager (`src/modules/package-manager.ts`)

Manages npm packages and provides Node.js module shims:
- `install()` - Register packages
- `require()` - Load modules
- Built-in shims for: fs, path, buffer, events, util, crypto, stream

**Implemented Shims:**
- **fs**: File system operations
- **path**: Path utilities (join, resolve, dirname, basename, extname)
- **buffer**: Buffer creation and utilities
- **events**: EventEmitter class
- **util**: Utility functions (format, inspect, inherits)
- **process**: Process object with env, cwd, argv
- **crypto**: randomBytes, randomUUID, subtle.digest
- **stream**: Readable, Writable, Transform classes

### Server Bridge (`src/modules/server-bridge.ts`)

Routes HTTP requests to handlers:
- `createServer()` - Set up fetch event listener
- `route()` - Register route handlers
- Automatic CORS header addition
- Pattern-based URL routing

### Container (`src/modules/container.ts`)

Orchestrates all modules:
- `createContainer()` - Create new instance
- `setupFileSystem()` - Initialize with files
- Provides access to all submodules

## Development Workflow

### Adding a New Module

1. Create type definition in `src/types/index.ts`
2. Implement module in `src/modules/`
3. Export from `src/index.ts`
4. Add tests in `tests/unit/`
5. Run `npm run build` to verify

### Adding a New Node.js Shim

1. Create shim file in `src/shims/`
2. Export from `src/shims/index.ts`
3. Register in `package-manager.ts` `require()` method
4. Add tests verifying the shim

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test -- tests/unit

# Run with coverage
npm run test -- --coverage

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test -- --watch
```

### Building

```bash
# Development build
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Preview production build
npm run preview
```

## Key Design Decisions

1. **In-Memory File System**: Simplifies implementation and improves performance
2. **Function Constructor for Code Execution**: Allows isolated global scope while supporting standard JavaScript APIs
3. **Module Shim Pattern**: Provides Node.js compatibility without bundling actual packages
4. **Type Safety**: Full TypeScript for better developer experience and fewer bugs
5. **Single Container Pattern**: One orchestrator manages all submodules

## Performance Considerations

- Virtual file operations are O(n) for path lookups
- Code execution creates new Function for each call
- Timeout mechanism prevents infinite loops
- Module cache reduces redundant shim creation
- Gzipped bundle size: ~4KB (main library)

## Testing Strategy

1. **Unit Tests**: Test each module independently
2. **Integration Tests**: Test module interactions through container
3. **E2E Tests**: Test demo interface with Playwright
4. **Type Tests**: TypeScript strict mode catches errors

## Future Improvements

- [ ] TypeScript transpilation in the browser
- [ ] Additional Node.js module shims (os, url, querystring)
- [ ] Service worker for offline support
- [ ] Module bundling and tree-shaking
- [ ] Hot Module Replacement (HMR) support
- [ ] Performance profiling and optimization
- [ ] Debugging tools and DevTools integration

## Contributing

When contributing:
1. Follow existing code style
2. Add tests for new features
3. Update TypeScript types
4. Run `npm run build` before committing
5. Update this documentation if needed
